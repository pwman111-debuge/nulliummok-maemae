---
description: 사용자가 'PUSH 하자' 라고 하면 현재 폴더의 보고서를 GitHub 저장소(https://github.com/pwman111-debuge/stockanalysis)의 "종목분석" 메뉴로 Push 합니다.
---

### 📌 [목적지 정보]
*   **저장소 URL:** `https://github.com/pwman111-debuge/stockanalysis`
*   **대상 메뉴:** **"종목분석"** (Stock Analysis)
*   **로컬 타겟 경로:** `..\주식 정보 웹페이지\krx-intelligence\content\stock-reports`

### 1단계: 보고서 파일 확인 및 프론트매터 검증
1. 현재 작업 폴더(`주식분석2`) 내의 `korean_stock_analysis_report.mdx` 파일을 읽습니다.
2. 파일 상단의 프론트매터(Frontmatter)에 다음 필드가 반드시 포함되어 있는지 확인합니다 (Contentlayer 스키마 필수 항목):
   - **필수 필드:** `title`, `date`, `reportType` (enum: fundamental 등), `rating` (enum: buy 등), `summary` (string), `ticker`, `market`, `term`, `currentPrice`, `targetPrice`, `stopLoss`.
   - 예시:
     ```yaml
     ---
     title: "주식 분석 리포트"
     date: "2026-03-27"
     reportType: "fundamental"
     rating: "buy"
     summary: "종목에 대한 간략한 요약 내용..."
     ticker: "005930"
     market: "KOSPI"
     term: "단기"
     currentPrice: 75000
     targetPrice: 95000
     stopLoss: 70000
     ---
     ```
3. 파일 내용에서 분석 대상 종목명을 추출합니다.
4. 오늘 날짜를 `YYYY-MM-DD` 형식으로 가져옵니다.
5. **[중요] 스키마 일치 여부 확인:** 
   - 대상 저장소(`..\주식 정보 웹페이지\krx-intelligence`)의 `contentlayer.config.ts` 파일을 읽어 `StockReport` 스키마 정의를 확인합니다.
   - 프론트매터에 사용된 모든 필드(예: `term`, `stopLoss`, `category`)가 스키마에 정의되어 있는지 확인하고, 누락된 필드가 있다면 **반드시 먼저 스키마를 업데이트**한 후 Push를 진행합니다.


### 2단계: 대상 저장소 경로 확인 및 파일 복사
1. GitHub 저장소의 로컬 경로인 `..\주식 정보 웹페이지\krx-intelligence` 폴더가 존재하는지 확인합니다.
2. 파일이 저장될 대상 경로인 `..\주식 정보 웹페이지\krx-intelligence\content\stock-reports`를 확인합니다.
3. `korean_stock_analysis_report.mdx` 파일을 해당 폴더로 복사하며, 파일명을 `YYYY-MM-DD-[종목명].mdx` 형식(영문 변환 권장, 예: `2026-03-18-samsung-electronics.mdx`)으로 변경하여 저장합니다.

### 3단계: GitHub Push 실행
// turbo
1. 대상 저장소 폴더(`..\주식 정보 웹페이지\krx-intelligence`)에서 Terminal 명령을 실행할 준비를 합니다.
// turbo
2. `git add content/stock-reports/` 명령을 실행하여 추가된 리포트를 스테이징합니다.
// turbo
3. `git commit -m "Add new stock report: [종목명] (YYYY-MM-DD)"` 명령으로 커밋합니다.
// turbo
4. `git push origin main` 명령을 실행하여 GitHub 저장소로 Push를 완료합니다.
5. Push가 성공하면 사용자에게 완료 메시지(GitHub "종목분석" 메뉴 업데이트 완료)와 푸시된 파일명을 안내합니다.
