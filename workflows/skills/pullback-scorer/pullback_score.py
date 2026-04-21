"""
눌림목 건강도 스코어 계산기 (Pullback Health Score)
======================================================
- 입력: 종목코드 (6자리)
- 출력: 0~100점 스코어 + 등급(S/A/B/C/✕) + 세부 배점 JSON
- 데이터 출처: 네이버 증권 단독 (finance.naver.com, m.stock.naver.com)
- 기준 문서: workflows/00_눌림목-정의.md §8

사용법:
    python pullback_score.py 005930
    python pullback_score.py 005930 --json
    python pullback_score.py 005930 005380 000660    # 복수 종목 일괄

정렬 원칙 (복수 종목):
    1차: 점수 DESC
    2차: 주 타점(20일선) 근접도 ASC
    3차: 시가총액 DESC
"""

from __future__ import annotations

import io
import json
import sys
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional

import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")


# ── 네이버 증권 API ───────────────────────────────────────────
MOBILE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://m.stock.naver.com/",
    "Accept": "application/json",
}


def _get_json(url: str) -> dict:
    resp = requests.get(url, headers=MOBILE_HEADERS, verify=False, timeout=10)
    resp.raise_for_status()
    return resp.json()


def fetch_price_history(code: str, days: int = 120) -> list[dict]:
    """네이버 모바일 차트 API에서 일봉 히스토리 조회.

    Returns list of dicts: {date, open, high, low, close, volume}
    """
    url = (
        f"https://api.stock.naver.com/chart/domestic/item/{code}"
        f"?periodType=dayCandle&count={days}"
    )
    data = _get_json(url)
    candles = []
    for row in data.get("priceInfos", []):
        candles.append({
            "date": row.get("localDate"),
            "open": float(row.get("openPrice", 0)),
            "high": float(row.get("highPrice", 0)),
            "low": float(row.get("lowPrice", 0)),
            "close": float(row.get("closePrice", 0)),
            "volume": int(row.get("accumulatedTradingVolume", 0)),
        })
    return candles


def fetch_basic(code: str) -> dict:
    """종목 기본 정보 (시가총액, 종목명, 외국인/기관 수급 포함 개요)."""
    url = f"https://m.stock.naver.com/api/stock/{code}/basic"
    try:
        return _get_json(url)
    except Exception:
        return {}


def fetch_investor(code: str) -> list[dict]:
    """투자자별 매매동향 (외국인/기관 일별 순매수)."""
    url = f"https://m.stock.naver.com/api/stock/{code}/trend"
    try:
        data = _get_json(url)
        return data.get("trends", [])
    except Exception:
        return []


# ── 보조 계산기 ──────────────────────────────────────────────
def sma(values: list[float], period: int) -> Optional[float]:
    if len(values) < period:
        return None
    return sum(values[-period:]) / period


def classify_market_cap(market_cap_billion: float) -> str:
    """시총(억원) 기준 구분."""
    if market_cap_billion >= 30_000:
        return "대형주"
    if market_cap_billion >= 5_000:
        return "중형주"
    return "중소형주"


def normal_rise_threshold(cap_class: str) -> float:
    """시총 구분별 정상 선행 상승폭(%)."""
    return {"대형주": 10.0, "중형주": 15.0, "중소형주": 20.0}.get(cap_class, 15.0)


def normal_pullback_range(cap_class: str) -> tuple[float, float]:
    """시총 구분별 정상 조정 폭(%)."""
    return {
        "대형주": (5.0, 10.0),
        "중형주": (7.0, 12.0),
        "중소형주": (10.0, 15.0),
    }.get(cap_class, (7.0, 12.0))


# ── 스코어 계산 ──────────────────────────────────────────────
@dataclass
class PullbackScore:
    code: str
    name: str = ""
    market_cap_billion: float = 0.0
    cap_class: str = ""
    current_price: float = 0.0
    recent_high: float = 0.0
    pullback_pct: float = 0.0              # 고점比 현재가 하락률
    pullback_days: int = 0                 # 고점 이후 경과 거래일
    fib_retracement: float = 0.0           # 되돌림 비율 (38.2 / 50 / 61.8 비교용)
    sma5: Optional[float] = None
    sma20: Optional[float] = None
    sma60: Optional[float] = None
    sma120: Optional[float] = None
    closest_ma: str = ""                   # 가장 가까운 이평선
    closest_ma_dist_pct: float = 0.0       # 가장 가까운 이평선 거리(%)
    vol_ratio: float = 0.0                 # 조정 구간 평균 거래량 / 직전 20일 평균
    rise_20d_pct: float = 0.0              # 최근 20거래일 저점比 상승률
    hit_52w_high: bool = False
    foreign_institution_net: str = ""      # "동반", "일방", "없음"

    # 세부 점수
    a_score: int = 0                       # 상승 추세 (40점)
    b_score: int = 0                       # 조정 품질 (35점)
    c_score: int = 0                       # 지지선 근접 (25점)

    total: int = 0
    grade: str = ""
    eligible: bool = True
    disqualified_reasons: list[str] = field(default_factory=list)

    def compute(self):
        self.total = self.a_score + self.b_score + self.c_score
        if not self.eligible:
            self.total = 0
            self.grade = "✕"
        elif self.total >= 85:
            self.grade = "S"
        elif self.total >= 70:
            self.grade = "A"
        elif self.total >= 55:
            self.grade = "B"
        elif self.total >= 40:
            self.grade = "C"
        else:
            self.grade = "✕"


def score_stock(code: str) -> PullbackScore:
    score = PullbackScore(code=code)

    # 1) 데이터 수집
    candles = fetch_price_history(code, days=120)
    if len(candles) < 60:
        score.eligible = False
        score.disqualified_reasons.append("데이터 부족 (60일 미만)")
        score.compute()
        return score

    basic = fetch_basic(code)
    score.name = basic.get("stockName", "")
    score.market_cap_billion = float(basic.get("marketValue", 0)) / 1e8 if basic else 0.0
    score.cap_class = classify_market_cap(score.market_cap_billion or 5_000)

    closes = [c["close"] for c in candles]
    highs = [c["high"] for c in candles]
    lows = [c["low"] for c in candles]
    vols = [c["volume"] for c in candles]
    score.current_price = closes[-1]

    # 이평선
    score.sma5 = sma(closes, 5)
    score.sma20 = sma(closes, 20)
    score.sma60 = sma(closes, 60)
    score.sma120 = sma(closes, 120)

    # 최근 고점 (20거래일 내)
    window = 20
    recent_highs = highs[-window:]
    score.recent_high = max(recent_highs)
    high_idx_from_end = len(recent_highs) - 1 - recent_highs[::-1].index(score.recent_high)
    score.pullback_days = window - 1 - high_idx_from_end

    # 고점比 현재가 하락률
    score.pullback_pct = (score.current_price - score.recent_high) / score.recent_high * 100

    # 최근 20거래일 저점 → 현재 고점까지 상승률
    low_20d = min(lows[-window:])
    score.rise_20d_pct = (score.recent_high - low_20d) / low_20d * 100 if low_20d else 0.0

    # 52주 신고가 여부
    high_120 = max(highs)
    score.hit_52w_high = score.recent_high >= high_120 * 0.999

    # 피보나치 되돌림 비율 계산
    if score.rise_20d_pct > 0:
        fall = score.recent_high - score.current_price
        rise = score.recent_high - low_20d
        score.fib_retracement = (fall / rise * 100) if rise else 0.0

    # 거래량 비율 (조정 구간 / 직전 20일)
    adj_days = max(1, score.pullback_days)
    vol_adj = sum(vols[-adj_days:]) / adj_days if adj_days else 0
    vol_prev20 = sum(vols[-(20 + adj_days):-adj_days]) / 20 if len(vols) >= 20 + adj_days else 0
    score.vol_ratio = (vol_adj / vol_prev20 * 100) if vol_prev20 else 0.0

    # 외국인/기관 수급 (최근 5~20거래일 net)
    trends = fetch_investor(code)
    if trends:
        f_net = sum(t.get("foreignerPureBuyQuant", 0) for t in trends[:20])
        i_net = sum(t.get("organPureBuyQuant", 0) for t in trends[:20])
        if f_net > 0 and i_net > 0:
            score.foreign_institution_net = "동반"
        elif f_net > 0 or i_net > 0:
            score.foreign_institution_net = "일방"
        else:
            score.foreign_institution_net = "없음"

    # 2) 배제 조건 체크
    if score.sma20 and score.sma60 and score.sma20 < score.sma60:
        score.eligible = False
        score.disqualified_reasons.append("이평선 역배열 (20일 < 60일)")

    if score.pullback_pct < -15.0:
        score.eligible = False
        score.disqualified_reasons.append(f"고점比 하락 -{abs(score.pullback_pct):.1f}% (>-15%)")

    if score.pullback_days >= 16:
        score.eligible = False
        score.disqualified_reasons.append(f"조정 기간 {score.pullback_days}일 (≥16)")

    if score.vol_ratio > 120:
        score.eligible = False
        score.disqualified_reasons.append(f"거래량 급증 {score.vol_ratio:.0f}% (투매 의심)")

    if not score.eligible:
        score.compute()
        return score

    # 3) A. 상승 추세 건전성 (40점)
    a = 0
    # A1 이평선 정배열 + 기울기
    sma20_prev = sma(closes[:-5], 20)
    sma60_prev = sma(closes[:-5], 60)
    if (score.sma20 and score.sma60 and score.sma20 > score.sma60
            and sma20_prev and sma60_prev
            and score.sma20 > sma20_prev and score.sma60 > sma60_prev):
        a += 15
    elif score.sma20 and score.sma60 and score.sma20 > score.sma60:
        a += 8

    # A2 직전 상승폭
    normal_rise = normal_rise_threshold(score.cap_class)
    if score.rise_20d_pct >= normal_rise * 1.5:
        a += 10
    elif score.rise_20d_pct >= normal_rise:
        a += 7

    # A3 신고가 이력
    if score.hit_52w_high:
        a += 10
    else:
        high_60 = max(highs[-60:])
        if score.recent_high >= high_60 * 0.999:
            a += 5

    # A4 수급
    if score.foreign_institution_net == "동반":
        a += 5
    elif score.foreign_institution_net == "일방":
        a += 3

    score.a_score = a

    # 4) B. 조정 품질 (35점)
    b = 0
    # B1 피보나치 되돌림
    fib = score.fib_retracement
    if 33 <= fib <= 43:
        b += 15
    elif 45 <= fib <= 55:
        b += 12
    elif 57 <= fib <= 67:
        b += 10

    # B2 조정 기간
    if 3 <= score.pullback_days <= 7:
        b += 10
    elif 8 <= score.pullback_days <= 10:
        b += 7
    elif 11 <= score.pullback_days <= 15:
        b += 3

    # B3 거래량 감소
    if score.vol_ratio <= 70:
        b += 10
    elif score.vol_ratio <= 100:
        b += 5

    score.b_score = b

    # 5) C. 지지선 근접도 (25점)
    c = 0
    ma_candidates = [
        ("5일선", score.sma5, 7),
        ("20일선", score.sma20, 10),
        ("60일선", score.sma60, 8),
        ("120일선", score.sma120, 5),
    ]
    distances = []
    for name, ma, weight in ma_candidates:
        if ma is None:
            continue
        dist = abs(score.current_price - ma) / ma * 100
        distances.append((name, ma, weight, dist))

    if distances:
        name, ma, weight, dist = min(distances, key=lambda x: x[3])
        score.closest_ma = name
        score.closest_ma_dist_pct = round(dist, 2)

        if dist <= 2:
            c += 15
        elif dist <= 5:
            c += 10
        elif dist <= 8:
            c += 5

        c += weight

    score.c_score = c
    score.compute()
    return score


# ── 정렬 및 출력 ─────────────────────────────────────────────
def rank_stocks(scores: list[PullbackScore]) -> list[PullbackScore]:
    return sorted(
        scores,
        key=lambda s: (-s.total,
                       s.closest_ma_dist_pct if s.closest_ma == "20일선" else 999,
                       -s.market_cap_billion)
    )


def print_table(scores: list[PullbackScore]):
    print(f"\n{'순위':>3} {'코드':>7} {'종목명':<12} {'점수':>4} {'등급':>3} "
          f"{'조정%':>6} {'일수':>4} {'Fib%':>6} {'주이평':<6} {'거리%':>6} {'수급':<4}")
    print("─" * 80)
    for i, s in enumerate(rank_stocks(scores), 1):
        print(f"{i:>3} {s.code:>7} {s.name[:10]:<12} {s.total:>4} {s.grade:>3} "
              f"{s.pullback_pct:>6.1f} {s.pullback_days:>4} {s.fib_retracement:>6.1f} "
              f"{s.closest_ma[:6]:<6} {s.closest_ma_dist_pct:>6.2f} "
              f"{s.foreign_institution_net:<4}")
        if s.disqualified_reasons:
            for r in s.disqualified_reasons:
                print(f"      └─ ❌ {r}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    as_json = "--json" in sys.argv

    if not args:
        print(__doc__)
        sys.exit(1)

    scores = []
    for code in args:
        try:
            scores.append(score_stock(code))
        except Exception as e:
            print(f"[ERROR] {code}: {e}", file=sys.stderr)

    if as_json:
        payload = [asdict(s) for s in rank_stocks(scores)]
        print(json.dumps(payload, ensure_ascii=False, indent=2, default=str))
    else:
        print_table(scores)


if __name__ == "__main__":
    main()
