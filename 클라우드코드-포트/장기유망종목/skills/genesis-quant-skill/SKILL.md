---
name: Genesis-Quant-Skill
description: 네이버 증권 기반 한국 주식 퀀트 스크리닝 및 장기 유망 종목 자동 발굴 스킬
---

# Genesis-Quant-Skill

네이버 증권(메인) + FinanceDataReader를 활용하여 장기 유망 종목을 퀀트 기반으로 자동 스크리닝합니다.  
워크플로우 `genesis-long-term.md` 2단계 퍼널을 실제로 실행하는 핵심 스킬입니다.

## 실행 방법

스크립트 위치: `skills/genesis-quant-skill/scripts/gene-scan.py`  
**프로젝트 루트(`장기유망종목/`)에서 실행**

```bash
# KRX 전체 스캔 (시가총액 500억 이상)
python -X utf8 skills/genesis-quant-skill/scripts/gene-scan.py

# 특정 섹터만 스캔 (워크플로우 1단계에서 확정된 섹터명 입력)
python -X utf8 skills/genesis-quant-skill/scripts/gene-scan.py --sector 반도체

# 특정 종목 코드 직접 분석
python -X utf8 skills/genesis-quant-skill/scripts/gene-scan.py --tickers 005930 000660 035420

# 상위 20개 출력
python -X utf8 skills/genesis-quant-skill/scripts/gene-scan.py --top 20

# 시계열 분석 + 차트 + JSON (워크플로우 3단계 지원)
python -X utf8 skills/genesis-quant-skill/scripts/gene-scan.py --sector 반도체 --detail

# 보고서용 원본 데이터 출력 (워크플로우 5단계 지원, 현재가 + 재무 Markdown표)
python -X utf8 skills/genesis-quant-skill/scripts/gene-scan.py --tickers 005930 000660 --report-data
```

## 스크리닝 기준 (워크플로우 2단계 퍼널)

### 1차 필터 — 재무 건전성 (4개 중 3개 이상 통과)
| 항목 | 기준 |
|------|------|
| ROE | 15% 이상 |
| 영업이익률 | 8% 이상 |
| 부채비율 | 200% 이하 |
| 매출 추이 | 최근 3개년 연속 우상향 |

### 2차 필터 — 성장성 및 밸류에이션
| 항목 | 기준 |
|------|------|
| EPS YoY 성장률 | 10% 이상 |
| PBR | 2.0 이하 (간이 기준) |

## 데이터 소스

- **메인:** 네이버 증권 (`finance.naver.com/item/main.naver?code={ticker}`)
- **보조:** FinanceDataReader (KRX 종목 리스트, 시가총액)

## 출력

- 터미널: 스크리닝 결과 요약표
- 파일: `genesis_scan_result.csv` (UTF-8, 엑셀 호환)

## 의존성

```
requests
pandas
beautifulsoup4
lxml
FinanceDataReader
```

---
> [!IMPORTANT]
> 전체 KRX 스캔 시 요청 간격(0.4초)으로 인해 수백 종목 처리에 시간이 소요됩니다.
> 섹터 필터(`--sector`)를 활용하여 범위를 먼저 좁히면 빠르게 실행할 수 있습니다.
