@echo off
cd /d "c:\Users\hwang\OneDrive\바탕 화면\안티그라비티폴더\주식 정보 웹페이지\krx-intelligence"
git add content/picks/20260410-genesis-report.mdx
git commit -m "feat: [2026-04-10] 단기 유망 종목 보고서 업데이트"
git pull --rebase origin main
git push origin main
