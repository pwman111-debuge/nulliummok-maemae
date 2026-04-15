---
name: naver-data-fetcher
description: WebFetch가 네이버 증권에 차단될 때 Python Bash로 네이버 증권 API를 직접 호출하여 재무·수급·컨센서스 데이터를 수집하는 폴백 스킬입니다.
---

# 네이버 증권 데이터 수집 (Python Bash 폴백)

## 언제 사용하나
`browser_subagent` 또는 `WebFetch`가 `finance.naver.com`에 접근 실패(차단/타임아웃)할 때 이 스킬로 대체합니다.

## 실행 방법

```bash
python skills/naver-data-fetcher/fetch_naver.py [ticker]
```

예시:
```bash
python skills/naver-data-fetcher/fetch_naver.py 005930
```

## 수집 데이터 범위

| 단계 | 수집 항목 | API 소스 |
| :--- | :--- | :--- |
| **1-A** | 현재가, 등락률, 시가총액, 52주 고저, PER/PBR/EPS/배당수익률, 외인소진율 | `m.stock.naver.com/api/stock/{ticker}/integration` |
| **1-B** | 매출액·영업이익·순이익·영업이익률·ROE·EPS·PER·PBR·부채비율 (3개년+전망치) | `m.stock.naver.com/api/stock/{ticker}/finance/annual` |
| **2-A** | 컨센서스 목표주가(최고/최저), 투자의견 점수, 참여 증권사 수 | `finance.naver.com/item/coinfo.naver?target=con` (EUC-KR) |
| **2-B** | 최근 증권사 리포트 5건 (증권사명, 제목, 날짜) | `m.stock.naver.com/api/stock/{ticker}/integration` |
| **3-A** | 최근 5일 외국인/기관 순매수 수량, 외국인 보유율 | `m.stock.naver.com/api/stock/{ticker}/integration` |
| **3-B** | 최근 공시 5건 | `finance.naver.com/item/dsclose.naver?code={ticker}` (EUC-KR) |

## 검증된 API 엔드포인트

```
# 실시간 시세 + 수급 + 리포트 통합
https://m.stock.naver.com/api/stock/{ticker}/integration

# 연간 재무 테이블 (JSON)
https://m.stock.naver.com/api/stock/{ticker}/finance/annual

# 컨센서스 탭 (HTML, EUC-KR)
https://finance.naver.com/item/coinfo.naver?code={ticker}&target=con

# 공시 탭 (HTML, EUC-KR)
https://finance.naver.com/item/dsclose.naver?code={ticker}

# 실시간 시세 JSON (폴링)
https://polling.finance.naver.com/api/realtime/domestic/stock/{ticker}
```

## 워크플로우 연동 방법

`analyze-stock.md`의 각 단계에서 `browser_subagent` 접근 실패 시 아래 순서로 폴백합니다.

1. `browser_subagent` 또는 `WebFetch` 시도
2. 실패 시 → `Bash` 도구로 `python skills/naver-data-fetcher/fetch_naver.py {ticker}` 실행
3. 출력 결과를 그대로 리포트 작성에 활용

## 주의사항
- 네이버 증권 HTML 페이지(EUC-KR)는 JavaScript 렌더링 데이터를 포함하지 않으므로 PER 테이블 등 일부 항목은 JSON API에서 수집합니다.
- `requests` 라이브러리가 필요합니다. 미설치 시: `pip install requests`
