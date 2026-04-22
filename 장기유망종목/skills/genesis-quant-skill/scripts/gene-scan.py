# -*- coding: utf-8 -*-
"""
Genesis Quant Scan - 네이버 증권 기반 장기 유망 종목 스크리너
워크플로우 genesis-long-term.md 2~3단계 자동화

사용법:
  python gene-scan.py                              # KRX 전체 스캔
  python gene-scan.py --sector 반도체              # 특정 섹터만
  python gene-scan.py --tickers 005930 000660      # 특정 종목만 분석
  python gene-scan.py --top 10                     # 상위 N개 출력 (기본 10)
  python gene-scan.py --sector 반도체 --detail     # 스캔 + 시계열 분석 + 차트 + JSON
"""

import requests
import pandas as pd
import io
import time
import argparse
import sys
import json
import os
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import FinanceDataReader as fdr
import matplotlib
matplotlib.use("Agg")  # 화면 없이 파일로 저장
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib import rcParams
rcParams["font.family"] = "Malgun Gothic"  # 한글 폰트
rcParams["axes.unicode_minus"] = False

# Windows 터미널 UTF-8 출력 강제
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ─────────────────────────────────────────
# 워크플로우 섹터 키워드 → 네이버 업종 실명 매핑
# (네이버 업종명에 없는 키워드 사용 시 이 테이블로 변환)
# ─────────────────────────────────────────
SECTOR_ALIAS: dict[str, list[str]] = {
    "AI인프라":   ["반도체", "전자부품", "기술하드웨어"],
    "전력설비":   ["전기장비", "전기전자부품"],
    "원전/SMR":   ["에너지장비및서비스"],
    "방산":       ["우주항공과국방"],
    "조선":       ["조선"],
    "AI":         ["반도체", "소프트웨어", "IT서비스"],
}

# ─────────────────────────────────────────
# 설정값 (워크플로우 2단계 기준)
# ─────────────────────────────────────────
FILTER = {
    "min_marcap":       50_000_000_000,   # 시가총액 500억 이상 (원)
    "min_roe":          15.0,              # ROE 15% 이상
    "min_op_margin":     8.0,              # 영업이익률 8% 이상
    "max_debt_ratio":  200.0,              # 부채비율 200% 이하
    "min_eps_growth":   10.0,              # EPS YoY 성장률 10% 이상
    "max_pbr_pct":      50.0,              # 역사적 PBR 밴드 하단 50% 이내 (현재는 PBR < 2 간이 기준)
    "pass_min":          3,                # 1차 필터 4개 중 N개 이상 통과
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# 네이버 증권 재무 테이블 row 인덱스 매핑
ROW_MAP = {
    "매출액":       0,
    "영업이익":     1,
    "영업이익률":   3,
    "ROE":          5,
    "부채비율":     6,
    "EPS":          9,
    "PER":         10,
    "BPS":         11,
    "PBR":         12,
}

# ─────────────────────────────────────────
# 네이버 증권 재무 데이터 수집
# ─────────────────────────────────────────
def fetch_naver_finance(ticker: str) -> dict | None:
    """
    네이버 증권 종목 메인 페이지에서 연간 재무 데이터를 추출한다.
    반환: dict (ROE, 영업이익률, 부채비율, PER, PBR, EPS_전년, EPS_현재, 매출액_list 등)
    실패 시: None
    """
    url = f"https://finance.naver.com/item/main.naver?code={ticker}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=8)
        r.encoding = "euc-kr"
    except Exception:
        return None

    soup = BeautifulSoup(r.text, "html.parser")
    tables = soup.find_all("table")

    if len(tables) < 5:
        return None

    try:
        df = pd.read_html(io.StringIO(str(tables[4])))[0]
    except Exception:
        return None

    # 연간 컬럼: 1, 2, 3번째 (최근 3개년)
    # df.iloc[row_index, col_index]  col 0=항목명, 1=3년전, 2=2년전, 3=1년전(최근), 4=예상
    try:
        def safe_float(val):
            try:
                return float(str(val).replace(",", "").strip())
            except Exception:
                return None

        # 최근 연간 기준 (col index 3 = 가장 최근 확정 연도)
        roe         = safe_float(df.iloc[ROW_MAP["ROE"],         3])
        op_margin   = safe_float(df.iloc[ROW_MAP["영업이익률"],  3])
        debt_ratio  = safe_float(df.iloc[ROW_MAP["부채비율"],    3])
        per         = safe_float(df.iloc[ROW_MAP["PER"],         3])
        pbr         = safe_float(df.iloc[ROW_MAP["PBR"],         3])
        eps_prev    = safe_float(df.iloc[ROW_MAP["EPS"],         2])  # 전년
        eps_curr    = safe_float(df.iloc[ROW_MAP["EPS"],         3])  # 최근
        rev_list    = [
            safe_float(df.iloc[ROW_MAP["매출액"], c]) for c in [1, 2, 3]
        ]
        op_list     = [
            safe_float(df.iloc[ROW_MAP["영업이익"], c]) for c in [1, 2, 3]
        ]

        bps = safe_float(df.iloc[ROW_MAP["BPS"], 3])

        result = {
            "ROE":        roe,
            "영업이익률": op_margin,
            "부채비율":   debt_ratio,
            "PER":        per,
            "PBR":        pbr,
            "BPS":        bps,
            "EPS_전년":   eps_prev,
            "EPS_최근":   eps_curr,
            "매출_추이":  rev_list,
            "영업익_추이": op_list,
        }

        # ── 정합성 검증: 재무 테이블 파싱 오류 차단 ──
        # 잘못된 테이블 행을 읽으면 ROE·영업이익률이 비현실적으로 커짐
        if roe        is not None and abs(roe)        > 500:   return None
        if op_margin  is not None and abs(op_margin)  > 100:   return None
        if debt_ratio is not None and debt_ratio      < 0:     return None
        if debt_ratio is not None and debt_ratio      > 5000:  return None

        return result
    except Exception:
        return None


# ─────────────────────────────────────────
# 2단계 퍼널 필터 함수
# ─────────────────────────────────────────
def apply_funnel(data: dict) -> tuple[int, list[str]]:
    """
    1~3차 필터 적용 후 통과 점수와 실패 항목 반환
    returns: (pass_count, fail_reasons)
    """
    fails = []

    # ── 1차 필터 (Pass/Fail) ──
    checks = {
        "ROE 15% 이상":       (data.get("ROE"),       lambda v: v >= FILTER["min_roe"]),
        "영업이익률 8% 이상": (data.get("영업이익률"), lambda v: v >= FILTER["min_op_margin"]),
        "부채비율 200% 이하": (data.get("부채비율"),   lambda v: v <= FILTER["max_debt_ratio"]),
        "매출 우상향":        (data.get("매출_추이"),   lambda v: all(
            v[i] is not None and v[i+1] is not None and v[i+1] > v[i]
            for i in range(len(v)-1)
        ) if v else False),
    }
    pass_count = 0
    for label, (val, check) in checks.items():
        if val is not None and check(val):
            pass_count += 1
        else:
            fails.append(label)

    # ── 2차 필터 (성장·밸류) ──
    eps_p = data.get("EPS_전년")
    eps_c = data.get("EPS_최근")
    if eps_p and eps_c and eps_p > 0:
        eps_growth = (eps_c - eps_p) / abs(eps_p) * 100
        data["EPS_성장률"] = round(eps_growth, 1)
        if eps_growth < FILTER["min_eps_growth"]:
            fails.append(f"EPS성장 {eps_growth:.1f}% (기준 10%↑)")
    else:
        data["EPS_성장률"] = None
        fails.append("EPS성장 데이터 없음")

    # PBR 간이 기준 (역사적 밴드 없이 절대값 2 이하)
    pbr = data.get("PBR")
    if pbr and pbr > 2.0:
        fails.append(f"PBR {pbr} (기준 2 이하)")

    return pass_count, fails


# ─────────────────────────────────────────
# 메인 스캔
# ─────────────────────────────────────────
def run_scan(tickers: list[str], top_n: int = 10) -> pd.DataFrame:
    results = []
    total = len(tickers)

    print(f"\n[Genesis Scan] 대상 종목 {total}개 스캔 시작...")
    print("-" * 60)

    for idx, (code, name) in enumerate(tickers, 1):
        print(f"  [{idx:4d}/{total}] {name}({code}) ...", end=" ", flush=True)

        data = fetch_naver_finance(code)
        if data is None:
            print("데이터 없음")
            time.sleep(0.3)
            continue

        pass_count, fails = apply_funnel(data)

        if pass_count >= FILTER["pass_min"]:
            results.append({
                "코드":          code,
                "종목명":        name,
                "ROE(%)":        data.get("ROE"),
                "영업이익률(%)": data.get("영업이익률"),
                "부채비율(%)":   data.get("부채비율"),
                "PER(배)":       data.get("PER"),
                "PBR(배)":       data.get("PBR"),
                "BPS":           data.get("BPS"),
                "EPS성장(%)":    data.get("EPS_성장률"),
                "통과항목":      pass_count,
                "미통과":        " | ".join(fails) if fails else "없음",
            })
            print(f"✓ 통과 (1차:{pass_count}/4)")
        else:
            print(f"✗ 탈락 ({', '.join(fails[:2])}...)")

        time.sleep(0.4)   # 네이버 서버 부하 방지

    df = pd.DataFrame(results)
    if df.empty:
        return df

    df = df.sort_values("ROE(%)", ascending=False).reset_index(drop=True)
    return df.head(top_n)


# ─────────────────────────────────────────
# 네이버 증권 업종 목록 조회
# ─────────────────────────────────────────
def fetch_naver_sectors() -> list[tuple[str, str]]:
    """네이버 증권 업종 목록 반환 → [(no, 업종명), ...]"""
    url = "https://finance.naver.com/sise/sise_group.naver?type=upjong"
    try:
        r = requests.get(url, headers=HEADERS, timeout=8)
        r.encoding = "euc-kr"
        soup = BeautifulSoup(r.text, "html.parser")
        links = soup.select('a[href*=sise_group_detail]')
        sectors = []
        for a in links:
            no = a["href"].split("no=")[-1]
            name = a.text.strip()
            if no and name:
                sectors.append((no, name))
        return sectors
    except Exception:
        return []


def fetch_naver_sector_tickers(sector_no: str) -> list[tuple[str, str]]:
    """특정 업종 번호의 종목 리스트 반환 → [(코드, 종목명), ...]"""
    url = f"https://finance.naver.com/sise/sise_group_detail.naver?type=upjong&no={sector_no}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=8)
        r.encoding = "euc-kr"
        soup = BeautifulSoup(r.text, "html.parser")
        stocks = soup.select('a[href*="/item/main.naver?code="]')
        results = []
        seen = set()
        for s in stocks:
            code = s["href"].split("code=")[-1].strip()
            name = s.text.strip()
            if code and name and code not in seen:
                seen.add(code)
                results.append((code, name))
        return results
    except Exception:
        return []


# ─────────────────────────────────────────
# 종목 리스트 가져오기 (네이버 업종 메인 / FDR 폴백)
# ─────────────────────────────────────────
def get_ticker_list(sector_keyword: str = None) -> list[tuple[str, str]]:
    # 시가총액 필터용 맵 (FDR)
    print("[Genesis Scan] KRX 시가총액 데이터 로딩 중...")
    try:
        krx = fdr.StockListing("KRX")
        marcap_map = dict(zip(
            krx["Code"].astype(str).str.zfill(6),
            krx["Marcap"]
        ))
    except Exception:
        marcap_map = {}

    if sector_keyword:
        # ── 네이버 증권 업종 분류로 섹터 종목 수집 (메인) ──
        print(f"[Genesis Scan] 네이버 증권 업종에서 '{sector_keyword}' 검색 중...")
        sectors = fetch_naver_sectors()

        # 1순위: SECTOR_ALIAS 매핑 (AI인프라·전력설비·원전SMR 등 워크플로우 전용 키워드)
        alias_keywords = SECTOR_ALIAS.get(sector_keyword, [])
        matched = []
        if alias_keywords:
            for alias in alias_keywords:
                matched += [(no, name) for no, name in sectors if alias in name]
            matched = list(dict.fromkeys(matched))  # 중복 제거·순서 유지
            if matched:
                print(f"  [별칭 매핑] '{sector_keyword}' → {alias_keywords}")

        # 2순위: 업종명에 키워드 포함 (정확한 부분 문자열 매칭)
        if not matched:
            matched = [(no, name) for no, name in sectors if sector_keyword in name]

        # 3순위: 2글자 이상 연속 부분 문자열 매칭 (글자 하나씩 매칭 금지)
        if not matched and len(sector_keyword) >= 2:
            sub = sector_keyword[:2]
            matched = [(no, name) for no, name in sectors if sub in name]
            if matched:
                print(f"  [2글자 매칭] '{sub}' 기준")

        if not matched:
            print(f"\n  [!] '{sector_keyword}'에 해당하는 업종을 찾지 못했습니다.")
            print(f"  SECTOR_ALIAS 테이블에 등록하거나 아래 업종명을 직접 사용하세요:")
            for no, name in sectors:
                print(f"    no={no:>4}  {name}")
            return []

        tickers = []
        for no, name in matched:
            print(f"  업종 매칭: [{no}] {name}")
            tickers += fetch_naver_sector_tickers(no)

        # 시가총액 500억 이상 필터
        if marcap_map:
            tickers = [(c, n) for c, n in tickers
                       if marcap_map.get(c, 0) >= FILTER["min_marcap"]]

        print(f"  시가총액 500억+ 필터 후 {len(tickers)}개")
        return tickers

    else:
        # ── 섹터 미지정: FDR 전체 종목 ──
        krx = krx[krx["Marcap"] >= FILTER["min_marcap"]]
        krx = krx[krx["MarketId"].isin(["STK", "KSQ"])]
        tickers = list(zip(krx["Code"].astype(str).str.zfill(6), krx["Name"]))
        print(f"  전체 스캔 — 시가총액 500억+ {len(tickers)}개")
        return tickers


# ─────────────────────────────────────────
# 보고서용 재무 데이터 직접 출력 (워크플로우 5단계 지원)
# ─────────────────────────────────────────
def fetch_report_data(ticker: str) -> dict | None:
    """
    네이버 증권에서 보고서 작성에 필요한 전체 데이터를 수집합니다.
    - 현재가 (실시간)
    - 연간 재무 데이터 (최근 3개년 확정 + 차년도 예상)
    - 연도 자동 산출
    """
    url = f"https://finance.naver.com/item/main.naver?code={ticker}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=8)
        r.encoding = "euc-kr"
    except Exception:
        return None

    soup = BeautifulSoup(r.text, "html.parser")

    # 현재가 수집
    price = None
    try:
        blind_tags = soup.select("em span.blind")
        for tag in blind_tags:
            val = tag.text.strip().replace(",", "")
            if val.isdigit() and int(val) > 1000:
                price = int(val)
                break
    except Exception:
        pass

    # 재무 테이블 수집
    tables = soup.find_all("table")
    if len(tables) < 5:
        return None
    try:
        df = pd.read_html(io.StringIO(str(tables[4])))[0]
    except Exception:
        return None

    # 연도 헤더 파싱 (튜플 컬럼에서 연도 추출)
    years = []
    for col in df.columns[1:5]:
        col_str = str(col)
        import re
        match = re.search(r"(\d{4}\.\d{2}(?:\(E\))?)", col_str)
        if match:
            years.append(match.group(1))
        else:
            years.append(str(col))

    def safe_val(row, col):
        try:
            v = df.iloc[row, col]
            return float(str(v).replace(",", "")) if str(v) not in ["nan", "-", "None"] else None
        except Exception:
            return None

    rows = {
        "매출액(억원)":    [safe_val(0, c) for c in range(1, 5)],
        "영업이익(억원)":  [safe_val(1, c) for c in range(1, 5)],
        "영업이익률(%)":   [safe_val(3, c) for c in range(1, 5)],
        "ROE(%)":          [safe_val(5, c) for c in range(1, 5)],
        "PER(배)":         [safe_val(10, c) for c in range(1, 5)],
        "PBR(배)":         [safe_val(12, c) for c in range(1, 5)],
    }

    return {
        "ticker":   ticker,
        "현재가":   price,
        "연도":     years,
        "재무":     rows,
        "출처":     f"네이버 증권 재무분석 탭 ({ticker}) — {datetime.today().strftime('%Y-%m-%d')} 기준",
    }


def print_report_data(tickers: list[tuple[str, str]]):
    """보고서 작성용 재무 데이터를 Markdown 표 형식으로 출력"""
    print(f"\n{'='*70}")
    print("  [Report Data] 네이버 증권 원본 데이터 — 보고서 직접 붙여넣기용")
    print(f"{'='*70}\n")

    for code, name in tickers:
        print(f"### {name} ({code})")
        data = fetch_report_data(code)
        if not data:
            print("  데이터 수집 실패\n")
            continue

        price_str = f"{data['현재가']:,}원" if data['현재가'] else "확인 필요"
        print(f"- **현재가 (네이버 증권 실시간):** {price_str}")
        print(f"- **출처:** {data['출처']}\n")

        years = data["연도"]
        fin    = data["재무"]

        # Markdown 표 출력
        header = "| 항목 | " + " | ".join(years) + " |"
        sep    = "|------|" + "------|" * len(years)
        print(header)
        print(sep)
        for label, vals in fin.items():
            row_vals = []
            for v in vals:
                if v is None:
                    row_vals.append("-")
                elif label in ["매출액(억원)", "영업이익(억원)"]:
                    row_vals.append(f"{v:,.0f}")
                else:
                    row_vals.append(str(v))
            print(f"| {label} | " + " | ".join(row_vals) + " |")
        print()
        time.sleep(0.5)


# ─────────────────────────────────────────
# 시계열 분석 (워크플로우 3단계 지원)
# ─────────────────────────────────────────
def fetch_price_history(ticker: str, years: int = 5) -> pd.DataFrame | None:
    """FDR로 최근 N년 일일 주가 데이터 수집"""
    end   = datetime.today()
    start = end - timedelta(days=365 * years)
    try:
        df = fdr.DataReader(ticker, start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d"))
        if df.empty:
            return None
        df.index = pd.to_datetime(df.index)
        return df
    except Exception:
        return None


def _tail_days(df: pd.DataFrame, days: int) -> pd.DataFrame:
    """최근 N 영업일 슬라이싱 (pandas 3.x 호환)"""
    cutoff = df.index[-1] - pd.tseries.offsets.BDay(days)
    return df[df.index >= cutoff]


def calc_52w_position(price_df: pd.DataFrame) -> dict:
    """52주 고점·저점 대비 현재 주가 위치 계산"""
    recent = _tail_days(price_df, 252)
    high52 = recent["High"].max()
    low52  = recent["Low"].min()
    close  = price_df["Close"].iloc[-1]
    rang   = high52 - low52
    pct    = round((close - low52) / rang * 100, 1) if rang > 0 else None
    return {
        "현재가":          int(close),
        "52주고점":        int(high52),
        "52주저점":        int(low52),
        "52주위치(%)":     pct,          # 0=저점, 100=고점, 30 이하면 안전마진
        "저점대비상승(%)": round((close - low52) / low52 * 100, 1) if low52 > 0 else None,
    }


def calc_pbr_band(price_df: pd.DataFrame, bps: float) -> dict | None:
    """
    역사적 PBR 밴드 계산
    - 일일 종가 / BPS → 일일 PBR 시계열
    - 밴드: 0.5x / 1.0x / 1.5x / 2.0x / 3.0x
    """
    if not bps or bps <= 0:
        return None
    try:
        pbr_series = price_df["Close"] / bps
        current_pbr = round(float(pbr_series.iloc[-1]), 2)
        pbr_1y = _tail_days(pbr_series.to_frame(), 252).iloc[:, 0]
        pbr_3y = _tail_days(pbr_series.to_frame(), 756).iloc[:, 0]

        return {
            "현재PBR":       current_pbr,
            "1년평균PBR":    round(float(pbr_1y.mean()), 2),
            "3년평균PBR":    round(float(pbr_3y.mean()), 2),
            "3년최저PBR":    round(float(pbr_3y.min()), 2),
            "3년최고PBR":    round(float(pbr_3y.max()), 2),
            "밴드하단50%":   round(float(pbr_3y.quantile(0.50)), 2),
            "저평가구간여부": current_pbr <= float(pbr_3y.quantile(0.50)),
        }
    except Exception:
        return None


def generate_chart(ticker: str, name: str, price_df: pd.DataFrame,
                   bps: float, out_dir: str) -> str | None:
    """
    주가 + PBR 밴드 차트 생성 → PNG 파일 저장
    반환: 저장된 파일 경로
    """
    try:
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8),
                                        gridspec_kw={"height_ratios": [3, 1]})
        fig.suptitle(f"{name} ({ticker})  |  Genesis 시계열 분석", fontsize=14, fontweight="bold")

        # ── 상단: 주가 + PBR 밴드 ──
        close = price_df["Close"]
        ax1.plot(close.index, close, color="#1f77b4", linewidth=1.2, label="종가")

        if bps and bps > 0:
            for mult, color, ls in [
                (0.5, "#27ae60", "--"),
                (1.0, "#2ecc71", "-"),
                (1.5, "#f39c12", "-"),
                (2.0, "#e67e22", "--"),
                (3.0, "#e74c3c", ":"),
            ]:
                band_price = bps * mult
                ax1.axhline(band_price, color=color, linestyle=ls,
                            linewidth=0.9, alpha=0.8, label=f"PBR {mult}x ({int(band_price):,}원)")

        # 52주 고저 음영
        recent_1y = _tail_days(price_df, 252)
        ax1.axhspan(recent_1y["Low"].min(), recent_1y["High"].max(),
                    alpha=0.06, color="gray", label="52주 밴드")

        ax1.set_ylabel("주가 (원)")
        ax1.legend(loc="upper left", fontsize=7)
        ax1.xaxis.set_major_formatter(mdates.DateFormatter("%Y-%m"))
        ax1.grid(True, alpha=0.3)

        # ── 하단: 거래량 ──
        ax2.bar(price_df.index, price_df["Volume"], color="#95a5a6", width=1.0, alpha=0.7)
        ax2.set_ylabel("거래량")
        ax2.xaxis.set_major_formatter(mdates.DateFormatter("%Y-%m"))
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        os.makedirs(out_dir, exist_ok=True)
        path = os.path.join(out_dir, f"{ticker}_{name}_chart.png")
        plt.savefig(path, dpi=130, bbox_inches="tight")
        plt.close()
        return path
    except Exception as e:
        plt.close()
        return None


def run_detail_analysis(scan_df: pd.DataFrame, out_dir: str):
    """
    스캔 통과 종목 대상 시계열 심층 분석
    - 52주 위치, PBR 밴드, 차트 PNG, JSON 저장
    """
    print(f"\n{'='*70}")
    print("  [Detail Mode] 시계열 심층 분석 시작 (워크플로우 3단계 지원)")
    print(f"{'='*70}")

    os.makedirs(out_dir, exist_ok=True)
    all_results = []

    for _, row in scan_df.iterrows():
        ticker = str(row["코드"]).zfill(6)
        name   = row["종목명"]
        bps_raw = row.get("BPS")
        bps    = float(bps_raw) if bps_raw and str(bps_raw) not in ["nan", "None"] else None

        print(f"\n  [{ticker}] {name} 시계열 수집 중...", flush=True)
        price_df = fetch_price_history(ticker, years=5)

        if price_df is None or price_df.empty:
            print("    주가 데이터 없음 — 건너뜀")
            continue

        w52   = calc_52w_position(price_df)
        pband = calc_pbr_band(price_df, bps)
        chart = generate_chart(ticker, name, price_df, bps, out_dir)

        result = {
            "ticker":   ticker,
            "name":     name,
            "snapshot": {
                "ROE(%)":        row.get("ROE(%)"),
                "영업이익률(%)": row.get("영업이익률(%)"),
                "부채비율(%)":   row.get("부채비율(%)"),
                "PER(배)":       row.get("PER(배)"),
                "PBR(배)":       row.get("PBR(배)"),
                "EPS성장(%)":    row.get("EPS성장(%)"),
            },
            "timeseries": {
                "52w": w52,
                "pbr_band": pband,
            },
            "chart_path": chart,
            "generated_at": datetime.today().strftime("%Y-%m-%d %H:%M"),
        }
        all_results.append(result)

        # 콘솔 요약 출력
        pos = w52.get("52주위치(%)")
        safety = "안전마진 구간" if pos is not None and pos <= 30 else "주의"
        print(f"    52주 위치: {pos}%  ({safety})")
        if pband:
            underval = "저평가" if pband["저평가구간여부"] else "적정~고평가"
            print(f"    PBR 밴드: 현재 {pband['현재PBR']}x / 3년 중앙 {pband['밴드하단50%']}x → {underval}")
        if chart:
            print(f"    차트 저장: {chart}")

        time.sleep(0.3)

    # JSON 저장
    if all_results:
        json_path = os.path.join(out_dir, "genesis_detail.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(all_results, f, ensure_ascii=False, indent=2, default=str)
        print(f"\n  JSON 저장 완료: {json_path}")

    print(f"\n{'='*70}")
    print(f"  Detail 분석 완료 — {len(all_results)}개 종목")
    print(f"  출력 폴더: {out_dir}")
    print(f"{'='*70}")


# ─────────────────────────────────────────
# 결과 출력
# ─────────────────────────────────────────
def print_result(df: pd.DataFrame):
    if df.empty:
        print("\n[결과] 조건을 통과한 종목이 없습니다.")
        return

    print(f"\n{'='*70}")
    print(f"  Genesis Quant 스크리닝 결과 — 상위 {len(df)}개")
    print(f"{'='*70}")
    cols = ["코드","종목명","ROE(%)","영업이익률(%)","부채비율(%)","PER(배)","PBR(배)","EPS성장(%)","통과항목"]
    print(df[cols].to_string(index=False))
    print(f"{'='*70}")
    print("※ 데이터 출처: 네이버 증권 / FinanceDataReader")
    print("※ 본 결과는 3단계 심층 수급 분석 후 최종 종목 선정에 활용됩니다.")


# ─────────────────────────────────────────
# CLI 진입점
# ─────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Genesis Quant Scanner")
    parser.add_argument("--sector",  type=str,   default=None,  help="섹터 키워드 (예: 반도체, 바이오)")
    parser.add_argument("--tickers", type=str,   nargs="+",     help="특정 종목 코드 직접 입력")
    parser.add_argument("--top",     type=int,   default=10,    help="출력 상위 N개 (기본 10)")
    parser.add_argument("--detail",  action="store_true",       help="시계열 심층 분석 + 차트 + JSON 생성 (워크플로우 3단계)")
    parser.add_argument("--report-data", action="store_true",    help="보고서용 네이버 증권 원본 데이터 출력 (워크플로우 5단계)")
    parser.add_argument("--out",     type=str,   default="genesis_output", help="출력 폴더 (기본: genesis_output)")
    args = parser.parse_args()

    # --report-data 전용 모드: 스캔 건너뛰고 지정 종목 데이터만 출력
    if args.report_data:
        if not args.tickers:
            print("[!] --report-data 는 --tickers 와 함께 사용해야 합니다.")
            sys.exit(1)
        krx = fdr.StockListing("KRX")
        code_map = dict(zip(krx["Code"].astype(str).str.zfill(6), krx["Name"]))
        target = [(t.zfill(6), code_map.get(t.zfill(6), t)) for t in args.tickers]
        print_report_data(target)
        sys.exit(0)

    if args.tickers:
        tickers = []
        krx = fdr.StockListing("KRX")
        code_map = dict(zip(krx["Code"].astype(str).str.zfill(6), krx["Name"]))
        for t in args.tickers:
            code = t.zfill(6)
            name = code_map.get(code, code)
            tickers.append((code, name))
    else:
        tickers = get_ticker_list(sector_keyword=args.sector)

    df = run_scan(tickers, top_n=args.top)
    print_result(df)

    # CSV 저장
    if not df.empty:
        os.makedirs(args.out, exist_ok=True)
        csv_path = os.path.join(args.out, "genesis_scan_result.csv")
        df.to_csv(csv_path, index=False, encoding="utf-8-sig")
        print(f"\n스캔 결과 저장: {csv_path}")

        # --detail 옵션: 시계열 심층 분석 + 차트 + JSON
        if args.detail:
            run_detail_analysis(df, out_dir=args.out)
