---
name: interactive-stock-chart
description: 웹 프로젝트에 자체 구축된 인터랙티브 주식 차트 컴포넌트를 MDX 리포트에 삽입하는 스킬입니다. 트레이딩뷰 위젯의 라이선스 제약 없이 한국 주식을 실시간으로 렌더링합니다.
---

# 인터랙티브 주식 차트 (Interactive Stock Chart)

이 스킬은 웹 프로젝트(`krx-intelligence`) 내에 자체 구축된 `StockChart` 컴포넌트를 활용하여 MDX 리포트에서 실시간 주가 차트를 렌더링하는 방법을 정의합니다.

## 🚀 실행 프로세스

1. **차트 컴포넌트 삽입:**
   리포트(`korean_stock_analysis_report.mdx`)의 "기술적 분석 및 대응 전략" 섹션 하단에 아래 태그를 삽입합니다.

   ```mdx
   <StockChart ticker="[종목코드]" market="[KOSPI|KOSDAQ]" title="[리포트용 제목]" />
   ```

   - `ticker`: 6자리 종목 코드 (예: 011070)
   - `market`: 코스피는 `KOSPI`, 코스닥은 `KOSDAQ`
   - `title`: 차트 상단에 표시될 제목 (예: LG이노텍 3개월 차트)

2. **데이터 처리 원리:**
   - 이 컴포넌트는 내부 API(`/api/stock/[ticker]`)를 통해 Yahoo Finance 데이터를 가져와 `lightweight-charts` 라이브러리로 렌더링합니다.
   - Cloudflare Edge 런타임에서 실행되며 24시간 캐싱을 통해 비용 발생 및 라이선스 문제를 원천 차단합니다.

## 🎯 사용 예시
- **User:** "리포트에 차트 넣어줘"
- **AI:** `<StockChart ticker="011070" market="KOSPI" title="LG이노텍 3개월 차트" />`를 MDX 파일의 적절한 위치에 자동으로 삽입합니다.
