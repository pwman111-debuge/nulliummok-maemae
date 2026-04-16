---
description: 제네시스 워크플로우용 네이버 증권 데이터 수집 스킬
trigger: 제네시스 데이터가 필요할 때, 네이버 증권 실시간 데이터 수집 시
---

# 네이버 증권 데이터 수집 스킬 (genesis-data)

워크플로우 각 단계에서 아래 bash 명령으로 실시간 데이터를 수집한다.
스크립트 경로: `scripts/naver_finance.py`

## 사용 명령 (단계별)

### 1단계 - 시장 국면 스캔
```bash
# KOSPI / KOSDAQ 지수 현재 상태
python scripts/naver_finance.py market

# 업종별 시세 (상위/하위 업종, 등락률, 상승↑/하락↓ 종목 수)
python scripts/naver_finance.py sector

# 테마별 시세 (인기 테마 순위)
python scripts/naver_finance.py theme
```

### 2단계 - 종목 스크리닝
```bash
# 특정 업종 내 종목 리스트 (sector 명령의 번호 활용)
python scripts/naver_finance.py screen [업종번호]
# 예: python scripts/naver_finance.py screen 267   (IT서비스 업종)

# 특정 종목 기본 정보 + 현재가 확정 (★ 현재가 기준 시각 자동 명시)
python scripts/naver_finance.py stock [종목코드]
# 예: python scripts/naver_finance.py stock 005930
```

### 3단계 - 수급 분석
```bash
# 투자자별 매매동향 (외국인/기관/개인 최근 20거래일)
python scripts/naver_finance.py investor [종목코드]

# 공매도 현황
python scripts/naver_finance.py short [종목코드]
```

### 전체 종합 (종목 한 번에)
```bash
python scripts/naver_finance.py all [종목코드]
# → stock + investor + short + 참고링크 한 번에 출력
```

## 출력 해석 가이드

| 명령 | 주요 출력 항목 | 활용 단계 |
|------|--------------|----------|
| `market` | KOSPI/KOSDAQ 지수, 등락률, 시장 상태 | 1단계 국면 판단 |
| `sector` | 업종명, 등락률, 상승↑/하락↓/전체 종목 수 | 1단계 섹터 선별 |
| `theme`  | 테마명, 등락률 순위 | 1단계 테마 교차검증 |
| `screen` | 업종 내 종목명, 코드, 현재가 | 2단계 초기 종목 풀 확보 |
| `stock`  | 현재가(★시각 명시), 등락, 시간외 현재가 | 2단계 시세 확정 |
| `investor` | 날짜별 종가, 외국인 순매수, 기관 동향 | 3단계 수급 분석 |
| `short`  | 공매도 비율, 대차잔고 | 3단계 공매도 분석 |

## 주의사항
- 스크립트는 반드시 프로젝트 루트에서 실행 (`중기 유망종목/` 폴더 기준)
- WebFetch로 finance.naver.com 직접 접근 불가 → 이 스크립트로 대체
- 네이버 증권 PC/모바일 API 혼합 사용 (자동 처리됨)
- 실시간 데이터이므로 보고서 작성 직전 `stock [코드]`로 현재가 재확인 필수

## 직접 확인 링크 (브라우저)
스크립트로 파싱되지 않는 심층 데이터는 아래 링크 직접 참조:
- 종목 종합: `https://finance.naver.com/item/main.naver?code={코드}`
- 증권사 목표주가: `https://finance.naver.com/item/coinfo.naver?code={코드}&target=cnc`
- DART 공시: `https://dart.fss.or.kr/dsab007/main.do?option=S&textCrpNm={회사명}`
- 종목토론실: `https://finance.naver.com/item/board.naver?code={코드}`
- 리서치: `https://finance.naver.com/research/company_list.naver?code={코드}`
