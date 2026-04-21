---
name: pullback-scorer
description: 눌림목 건강도 스코어(100점) 계산 스킬 — 네이버 증권 데이터 단독 사용
version: 1.0
data_source: 네이버 증권 (finance.naver.com, m.stock.naver.com)
reference: workflows/00_눌림목-정의.md §8
---

# pullback-scorer 스킬

> 발굴된 후보 종목에 **눌림목 건강도(0~100점)** 를 부여하고 **건강한 눌림 순으로 정렬**한다.

---

## 실행 방법

### 기본 (표 형태 출력)
```bash
python workflows/skills/pullback-scorer/pullback_score.py <종목코드> [<종목코드> ...]
```

### JSON 출력 (리포트 자동화용)
```bash
python workflows/skills/pullback-scorer/pullback_score.py 005930 005380 000660 --json
```

### 예시
```bash
# 단일 종목
python workflows/skills/pullback-scorer/pullback_score.py 005930

# 단기/중기/장기 후보 일괄 (발굴 워크플로우 내 호출)
python workflows/skills/pullback-scorer/pullback_score.py \
    005930 000660 042700 005380 007660 --json > scores.json
```

---

## 입력
- **종목코드 6자리** (KOSPI/KOSDAQ 모두 가능)
- 복수 입력 시 공백 구분
- 옵션: `--json` (stdout에 JSON 배열 출력)

## 출력 필드 (JSON 모드)
```json
{
  "code": "005930",
  "name": "삼성전자",
  "market_cap_billion": 3500000.0,
  "cap_class": "대형주",
  "current_price": 75000.0,
  "recent_high": 82000.0,
  "pullback_pct": -8.5,
  "pullback_days": 6,
  "fib_retracement": 42.3,
  "sma5": 76400.0,
  "sma20": 75900.0,
  "sma60": 72300.0,
  "sma120": 68000.0,
  "closest_ma": "20일선",
  "closest_ma_dist_pct": 1.18,
  "vol_ratio": 68.5,
  "rise_20d_pct": 21.0,
  "hit_52w_high": true,
  "foreign_institution_net": "동반",
  "a_score": 35,
  "b_score": 32,
  "c_score": 25,
  "total": 92,
  "grade": "S",
  "eligible": true,
  "disqualified_reasons": []
}
```

## 출력 필드 (표 모드)
```
순위  코드     종목명        점수  등급  조정%    일수  Fib%   주이평   거리%   수급
────────────────────────────────────────────────────────────────────────────────
  1  005930  삼성전자        92   S    -8.5     6   42.3   20일선    1.18   동반
  2  042700  한미반도체      85   S   -10.2     5   48.1   60일선    2.34   동반
  3  005380  현대차          68   B   -12.0     9   65.2   60일선    4.50   일방
      └─ (일부 배점 부족)
  4  000660  SK하이닉스       0   ✕   -16.3    12     —       —       —    —
      └─ ❌ 최근 20일 고점(일봉 기준) 대비 하락 -16.3% (>-15%)
```

---

## 스코어 구성 요약 (100점)

| 블록 | 항목 | 배점 |
|------|------|------|
| **A. 상승 추세 건전성** | 이평선 정배열+기울기 / 상승폭 / 신고가 / 수급 | 40 |
| **B. 조정 품질** | 피보나치 되돌림 / 조정 기간 / 거래량 감소 | 35 |
| **C. 지지선 근접** | 주요 이평선 거리 / 이평선 타점 가중치 | 25 |
| 배제 조건 해당 시 | 역배열 / -15% 초과 / 16일↑ / 거래량 급증 | 0 (탈락) |

> 상세 배점은 `workflows/00_눌림목-정의.md §8` 참조

---

## 등급 해석

| 등급 | 점수 | 판정 |
|------|------|------|
| **S** | 85~100 | 최우선 진입 — 매우 건강한 눌림 |
| **A** | 70~84 | 진입 추천 |
| **B** | 55~69 | 조건부 진입 (추가 확인 후) |
| **C** | 40~54 | 관망 |
| **✕** | <40 or 배제 | 제외 |

---

## 정렬 원칙 (복수 종목)

1순위: **총점 DESC** (S → A → B → C)
2순위: **주 타점(20일선) 근접도 ASC** (같은 점수라면 20일선에 가까운 종목 우선)
3순위: **시가총액 DESC** (대형주 우선 — 유동성)

---

## 데이터 소스 (네이버 증권 단독)

| 데이터 | API 엔드포인트 |
|--------|--------------|
| 일봉 히스토리 | `api.stock.naver.com/chart/domestic/item/{code}?periodType=dayCandle&count=120` |
| 종목 기본 정보 (시총·종목명) | `m.stock.naver.com/api/stock/{code}/basic` |
| 투자자별 매매동향 | `m.stock.naver.com/api/stock/{code}/trend` |

> DART, 증권사 컨센서스, 토스 증권, 구글 파이낸스 등 **기타 소스 사용 금지**

---

## 장애 대응

| 상황 | 처리 |
|------|------|
| API 타임아웃 (10초) | 해당 종목만 건너뛰고 리스트 계속 |
| 데이터 120일 미만 | 신규 상장 or 상폐 직전 → 자동 탈락 (`eligible=false`) |
| JSON 파싱 실패 | stderr에 에러 기록 후 다음 종목 진행 |

---

## 의존성
```
pip install requests beautifulsoup4 urllib3
```
표준 라이브러리 외에 위 3개만 사용. 기존 `중기유망종목/scripts/naver_finance.py`와 동일 스택.
