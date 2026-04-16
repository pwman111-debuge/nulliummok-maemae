---
description: "Market Data Miner Skill v2.0: curl 기반 네이버 증권 전 데이터 자동 수집기 (수급/지수/업종/테마/거시지표)"
---

# Market Data Miner Skill v2.0

제네시스(Genesis) 워크플로우의 **[Step 1] 데이터 수집** 전담 스킬.
모든 국내 시장 데이터를 **curl + 네이버 증권 직접 접근**으로 수집한다.

---

## ⚙️ 핵심 원칙

| 구분 | 방법 | 이유 |
|------|------|------|
| 수급/지수 | `curl` + 네이버 JSON API | WebFetch는 Claude 서버발 요청이라 naver 차단됨. curl은 로컬 PC 직접 요청 |
| 업종/테마 | `curl` + 네이버 HTML 파싱 (EUC-KR 디코딩) | JS 렌더링 없이 gzip 해제 → EUC-KR 디코딩으로 데이터 추출 가능 |
| 거시지표 | `WebFetch` (Investing.com) | 해당 도메인은 WebFetch 정상 접근 가능 |
| 공포지수 | `WebSearch` | 실시간 지수값은 검색으로 수집 |

> **절대 금지:** 수급·업종·지수 수집 시 WebFetch(finance.naver.com) 사용 금지.
> 뉴스 기사·속보의 수치를 수급 근거로 사용 금지. 반드시 아래 API/파싱 결과를 사용.

---

## [수집 1] 코스피/코스닥 수급 — 투자자별 매매동향 확정치

> 제네시스 워크플로우 최우선 신뢰 소스

```bash
# 코스피 수급 (단위: 억원)
curl -s \
  -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15" \
  -H "Accept: application/json" \
  "https://m.stock.naver.com/api/index/KOSPI/trend"

# 반환값 예시:
# {"bizdate":"20260413","personalValue":"+7,173","foreignValue":"-4,579","institutionalValue":"-6,698"}
# 필드: personalValue(개인), foreignValue(외국인), institutionalValue(기관계) — 단위 억원

# 코스닥 수급 (단위: 억원)
curl -s \
  -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15" \
  -H "Accept: application/json" \
  "https://m.stock.naver.com/api/index/KOSDAQ/trend"
```

**수집 후 확인사항:** `bizdate` 값이 오늘 날짜인지 반드시 확인. 장 미개장일이면 전일 데이터.

---

## [수집 2] 코스피/코스닥 지수 — 종가·등락률

```bash
# 코스피 (최근 20거래일, 첫 번째 항목 = 당일)
curl -s \
  -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15" \
  -H "Accept: application/json" \
  "https://m.stock.naver.com/api/index/KOSPI/price"

# 반환값 예시:
# [{"localTradedAt":"2026-04-13","closePrice":"5,808.62",
#   "compareToPreviousClosePrice":"-50.25","fluctuationsRatio":"-0.86",
#   "openPrice":"5,737.28","highPrice":"5,827.73","lowPrice":"5,730.23"}, ...]

# 코스닥
curl -s \
  -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15" \
  -H "Accept: application/json" \
  "https://m.stock.naver.com/api/index/KOSDAQ/price"
```

---

## [수집 3] 업종별 시세 — 네이버 증권 업종별 시세 전체

```bash
curl -s \
  -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" \
  -H "Accept-Encoding: gzip, deflate, br" \
  -H "Referer: https://finance.naver.com/" \
  -L \
  "https://finance.naver.com/sise/sise_group.naver?type=upjong" | \
  node -e "
const z = require('zlib');
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  const buf = Buffer.concat(chunks);
  let rawBuf;
  try { rawBuf = z.gunzipSync(buf); } catch(e) { rawBuf = buf; }
  const decoded = new TextDecoder('euc-kr').decode(rawBuf);
  const rows = decoded.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  const results = [];
  rows.forEach(row => {
    const nameMatch = row.match(/sise_group_detail\.naver[^>]+>([^<]+)</);
    const changeMatch = row.match(/([+-]\d+\.\d+)%/);
    if (nameMatch && changeMatch) {
      results.push({ name: nameMatch[1].trim(), change: parseFloat(changeMatch[1]) });
    }
  });
  results.sort((a, b) => b.change - a.change);
  console.log('=== 업종별 시세 강세 TOP 10 ===');
  results.slice(0, 10).forEach(r => console.log(r.name + ': ' + (r.change > 0 ? '+' : '') + r.change + '%'));
  console.log('=== 업종별 시세 약세 TOP 10 ===');
  results.slice(-10).reverse().forEach(r => console.log(r.name + ': ' + r.change + '%'));
  console.log('총 ' + results.length + '개 업종');
});
"
```

**파싱 원리:** gzip 압축 해제 → `TextDecoder('euc-kr')` 로 한글 디코딩 → `sise_group_detail` 링크에서 업종명 추출 → `[+-]숫자.숫자%` 패턴으로 등락률 추출

---

## [수집 4] 테마별 시세 — 네이버 증권 테마

```bash
curl -s \
  -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" \
  -H "Accept-Encoding: gzip, deflate, br" \
  -H "Referer: https://finance.naver.com/" \
  -L \
  "https://finance.naver.com/sise/theme.naver" | \
  node -e "
const z = require('zlib');
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  const buf = Buffer.concat(chunks);
  let rawBuf;
  try { rawBuf = z.gunzipSync(buf); } catch(e) { rawBuf = buf; }
  const decoded = new TextDecoder('euc-kr').decode(rawBuf);
  const rows = decoded.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  const results = [];
  rows.forEach(row => {
    const nameMatch = row.match(/sise_group_detail\.naver[^>]+>([^<]+)</);
    const changeMatch = row.match(/([+-]\d+\.\d+)%/);
    if (nameMatch && changeMatch) {
      results.push({ name: nameMatch[1].trim(), change: parseFloat(changeMatch[1]) });
    }
  });
  results.sort((a, b) => b.change - a.change);
  console.log('=== 테마 강세 TOP 10 ===');
  results.slice(0, 10).forEach(r => console.log(r.name + ': ' + (r.change > 0 ? '+' : '') + r.change + '%'));
  console.log('=== 테마 약세 TOP 5 ===');
  results.slice(-5).reverse().forEach(r => console.log(r.name + ': ' + r.change + '%'));
  console.log('총 ' + results.length + '개 테마');
});
"
```

---

## [수집 5] 거시 지표 — 환율/금리/유가

```
# 원/달러 환율
WebFetch URL: https://kr.investing.com/currencies/usd-krw
추출 요청: "현재 USD/KRW 환율, 전일 대비 등락폭과 등락률"

# 미국 10년물 국채 금리
WebFetch URL: https://kr.investing.com/rates-bonds/u.s.-10-year-bond-yield
추출 요청: "현재 금리값, 전일 대비 등락폭"

# WTI 국제 유가
WebFetch URL: https://kr.investing.com/commodities/crude-oil
추출 요청: "현재 WTI 유가, 전일 대비 등락률"
```

---

## [수집 6] 공포·탐욕 지수 (Fear & Greed Index)

```
WebSearch 검색어: "CNN Fear Greed Index today {현재연도}"
추출 목표: 현재 지수값(0~100)과 단계명(Extreme Fear / Fear / Neutral / Greed / Extreme Greed)
```

---

## 실행 체크리스트 (8단계 전 자동화)

```
[1] curl → m.stock.naver.com/api/index/KOSPI/trend     ✅ 코스피 외국인/기관/개인 순매수
[2] curl → m.stock.naver.com/api/index/KOSDAQ/trend    ✅ 코스닥 외국인/기관/개인 순매수
[3] curl → m.stock.naver.com/api/index/KOSPI/price     ✅ 코스피 종가·등락률·고저
[4] curl → m.stock.naver.com/api/index/KOSDAQ/price    ✅ 코스닥 종가·등락률·고저
[5] curl+node → sise_group.naver?type=upjong           ✅ 업종별 등락률 전체 (79개)
[6] curl+node → theme.naver                            ✅ 테마별 등락률 전체 (40개+)
[7] WebFetch → kr.investing.com (3회)                  ✅ 환율·금리·유가
[8] WebSearch → CNN Fear & Greed                       ✅ 투자심리 지수
```

**모든 항목 완전 자동화. 수동 보완 불필요.**

---

## 주의사항

- 단위: 수급은 **억원**, 지수는 **포인트**, 유가는 **USD/배럴**
- `bizdate` 확인: 장 미개장일(토·일·공휴일)은 직전 거래일 데이터 반환
- 업종/테마 파싱: node.js 필수 (TextDecoder EUC-KR 지원)
- 뉴스 속보 수치와 네이버 확정치가 다를 경우 **반드시 네이버 확정치 우선**
