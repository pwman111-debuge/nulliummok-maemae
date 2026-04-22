# 클라우드코드-눌림목매매 워크스페이스 가이드

## 프로젝트 목적

**눌림목 건강도 스코어링 기반**으로 단기·중기·장기 유망종목을 발굴하고
**6버킷(단/중/장 × 대세+/대세−)** 으로 분류한 리포트를 생성한다.

---

## 핵심 명령어

| 명령어 | 동작 |
|--------|------|
| **"제네시스 하자"** | `workflows/05_발굴-실행-워크플로우.md` 전체 파이프라인 실행 |
| **"리포트 보여줘"** | `workflows/reports/` 최신 리포트 출력 |

> **"제네시스 하자"** 명령 시 반드시 `workflows/05_발굴-실행-워크플로우.md` 를 읽고 STEP 1~6 순서대로 실행한다.

---

## 폴더 구조

```
클라우드코드-눌림목매매/
├── workflows/                          ← 발굴 파이프라인 (핵심)
│   ├── 00_눌림목-정의.md               ← 눌림목 개념 + 건강도 100점 공식
│   ├── 01_단기-유망종목-판별기준.md
│   ├── 02_중기-유망종목-판별기준.md
│   ├── 03_장기-유망종목-판별기준.md
│   ├── 04_대세섹터-판별기준.md
│   ├── 05_발굴-실행-워크플로우.md      ← "발굴 하자" 진입점
│   ├── 06_최종-리포트-템플릿.md
│   ├── README.md
│   ├── reports/                        ← 발굴 리포트 저장 (YYYYMMDD_발굴리포트.md)
│   ├── .cache/                         ← 중간 데이터 임시 저장 (단기/중기/장기 후보 코드)
│   └── skills/
│       └── pullback-scorer/
│           ├── SKILL.md
│           └── pullback_score.py       ← 눌림목 건강도 스코어러 (핵심 스킬)
│
├── 단기유망종목/
│   └── .agent/scratch/
│       └── fetch_top_stocks.py         ← 단기 수급 스크리닝
│
├── 중기유망종목/
│   └── scripts/
│       └── naver_finance.py            ← 시황/섹터/종목 데이터 수집
│
└── 장기유망종목/
    └── skills/genesis-quant-skill/
        └── scripts/
            └── gene-scan.py            ← 장기 퀀트 스캔
```

---

## 발굴 파이프라인 흐름

```
[STEP 1] 시황 판단 (공격/중립/방어)
         python 중기유망종목/scripts/naver_finance.py market
         ↓
[STEP 2] 대세섹터 확정 (고정 4대 + 당일 주도 섹터)
         python 중기유망종목/scripts/naver_finance.py sector
         ↓
[STEP 3] 후보 풀 수집 (병렬)
         단기 5~7종목 / 중기 5~7종목 / 장기 5~8종목
         → workflows/.cache/YYYYMMDD_short.txt 등 임시 저장
         ⚠️ 수급 스크립트 출력 첫 줄 날짜 반드시 확인 (당일 YY.MM.DD 일치 여부)
         ↓
[STEP 4] 눌림목 건강도 스코어링
         python workflows/skills/pullback-scorer/pullback_score.py <codes...> --json
         → workflows/.cache/YYYYMMDD_scores.json
         ↓
[STEP 5] 6버킷 태깅 (단/중/장 × 대세+/대세−)
         ↓
[STEP 6] 최종 리포트 생성
         → workflows/reports/YYYYMMDD_발굴리포트.md
```

---

## 스크립트 실행 예시

```bash
# 눌림목 스코어 단일 종목
python workflows/skills/pullback-scorer/pullback_score.py 005930

# 복수 종목 일괄 (JSON)
python workflows/skills/pullback-scorer/pullback_score.py 005930 000660 042700 --json

# 시황 조회
python 중기유망종목/scripts/naver_finance.py market

# 섹터/테마 조회
python 중기유망종목/scripts/naver_finance.py sector
python 중기유망종목/scripts/naver_finance.py theme

# 장기 퀀트 스캔
python 장기유망종목/skills/genesis-quant-skill/scripts/gene-scan.py --sector AI인프라 --top 20
```

---

## 발굴 원칙

1. **데이터 출처: 네이버 증권 단독** — DART·증권사·타 포털 금지
2. **발굴 전용** — 보유 포트폴리오 무시, 신규 후보만 제시
3. **방어 시황 시** — 발굴은 수행하되 전 종목에 `진입 보류` 플래그
4. **중복 종목** — 단/중/장 풀 동시 등장 시 점수가 가장 높은 기간에만 배치
5. **배제 조건 해당 종목** — 본문 제외, 부록에만 기재
6. **우팀장이 전권을 가지고 보고서를 완성한다** — Claude는 우팀장 지시에 따라 완전한 보고서를 작성·확정한다

---

## 눌림목 건강도 등급

| 등급 | 점수 | 판정 |
|------|------|------|
| **S** | 85~100 | 최우선 진입 — 매우 건강한 눌림 |
| **A** | 70~84 | 진입 추천 |
| **B** | 55~69 | 조건부 진입 |
| **C** | 40~54 | 관망 |
| **✕** | <40 or 배제 | 제외 |

---

## 6버킷 익절·손절 기준

| 버킷 | 1차 익절 | 2차 익절 | 손절 |
|------|----------|----------|------|
| 단기 × 대세(+/-) | R:R 2:1 기준 | - | - |
| 중기 × 대세(+) | +20% | +40% | -15% |
| 중기 × 대세(−) | +15% | +25% | -12% |
| 장기 × 대세(+) | +50% | +100% | -25% |
| 장기 × 대세(−) | +30% | +50% | -20% |
