---
name: naver-chart-capture
description: 종목 코드를 바탕으로 네이버 증권에 접속해 최근 3개월 주가 차트를 브라우저를 통해 캡처하고 리포트에 첨부하는 스킬입니다.
---

# 네이버 주가 차트 캡처 스킬 (Naver Chart Capture)

이 스킬은 종목 코드를 이용해 네이버 증권의 실시간 차트를 열고, 3개월 기준 차트를 스크린샷으로 캡처한 뒤 분석 리포트에 자동으로 첨부하는 방법을 정의합니다. 파이썬과 같은 별도 코딩이나 라이브러리 설치 없이, **브라우저 서브에이전트(browser_subagent)**를 활용해 구현됩니다. (*주의: 한국 거래소(KRX) 주식 데이터는 트레이딩뷰 등의 서드파티 외부 임베딩이 라이선스에 의해 차단되므로 반드시 이 방식의 캡처본을 사용해야 합니다.*)

## 🚀 실행 프로세스

사용자가 특정 종목에 대해 분석(제네시스 등)이나 차트 삽입을 지시할 때 자동 수행합니다.

### 1단계: 브라우저 서브에이전트 실행
AI는 `browser_subagent` 도구를 호출하여 차트를 캡처합니다.
- **접속 URL:** `https://finance.naver.com/item/main.naver?code={ticker}`
- **수행 작업 (Task):** 
  1. 위 URL로 이동하여 3개월 버튼을 누르고 이미지를 캡처(`capture_browser_screenshot`)합니다.
  2. 캡처된 파일을 분석 워크스페이스의 `assets/` 폴더(`주식분석2\assets` 및 웹페이지 `public\assets`)에 `[ticker]_3m_chart.png`로 저장합니다.

### 2단계: 리포트에 차트 이미지 반영
- AI는 `korean_stock_analysis_report.mdx` 기술적 분석 섹션 하단에 캡처 이미지를 HTML 태그로 주입합니다.
  - 예시: `<img src="/assets/[ticker]_3m_chart.png" alt="3개월 주가 차트" width="100%" />`

## 🎯 사용 예시
- **User:** "lg이노텍 분석리포트에 네이버 3개월 차트 캡처해서 넣어줘"
- **AI:** 이 `SKILL.md`를 참고하여 브라우저로 직접 캡처 후 MDX에 이미지 태그를 삽입합니다.
