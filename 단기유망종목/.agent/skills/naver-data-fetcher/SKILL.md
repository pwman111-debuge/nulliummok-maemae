---
name: naver-data-fetcher
description: 네이버 증권에서 시장 데이터를 Python Bash로 직접 수집하는 스킬 (로컬 PC 한국 IP 활용)
---

# 📡 Naver Data Fetcher 스킬

네이버 증권은 Claude의 WebFetch로 접근 불가(미국 IP 차단)하므로,
**Python Bash를 사용자 로컬 PC에서 실행**하여 데이터를 수집한다.

---

## 🔧 공통 헤더 (모든 함수에 적용)

```python
import urllib.request, re

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'ko-KR,ko;q=0.9',
    'Referer': 'https://finance.naver.com/'
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        return r.read().decode('euc-kr', errors='replace')
```

---

## [Function 1] KOSPI / KOSDAQ 지수 조회

```python
import urllib.request, re

HEADERS = {'User-Agent': 'Mozilla/5.0','Accept-Language': 'ko-KR,ko;q=0.9','Referer': 'https://finance.naver.com/'}

for code in ['KOSPI', 'KOSDAQ']:
    url = f'https://finance.naver.com/sise/sise_index_day.naver?code={code}'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        html = r.read().decode('euc-kr', errors='replace')
    rows = re.findall(r'(\d{4}\.\d{2}\.\d{2}).*?([\d,]+\.\d+)', html, re.DOTALL)
    if rows:
        print(f'{code} | {rows[0][0]} | {rows[0][1]}')
```

**출력 예시:**
```
KOSPI | 2026.04.14 | 5,967.75
KOSDAQ | 2026.04.14 | 1,093.63
```

---

## [Function 2] 외국인 순매수 상위 종목

```python
import urllib.request, re

HEADERS = {'User-Agent': 'Mozilla/5.0','Accept-Language': 'ko-KR,ko;q=0.9','Referer': 'https://finance.naver.com/sise/sise_deal_rank.naver'}

for market, sosok in [('KOSPI', '01'), ('KOSDAQ', '02')]:
    url = f'https://finance.naver.com/sise/sise_deal_rank_iframe.naver?sosok={sosok}&investor_gubun=9000&type=buy'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        html = r.read().decode('euc-kr', errors='replace')
    items = re.findall(
        r'code=(\d{6})[^>]*>(.*?)</a>.*?class="number">([\d,\-]+)</td>.*?class="number">([\d,\-]+)</td>',
        html, re.DOTALL
    )
    print(f'\n=== 외국인 순매수 상위 ({market}) ===')
    for code, name, price, amount in items[:10]:
        print(f'  {name.strip()} ({code}) | 현재가: {price} | 순매수: {amount}백만원')
```

**출력 예시:**
```
=== 외국인 순매수 상위 (KOSPI) ===
  SK하이닉스 (000660) | 현재가: 1,040,000 | 순매수: 455,035백만원
  한화에어로스페이스 (012450) | 현재가: 1,530,000 | 순매수: 39,585백만원
```

---

## [Function 3] 기관 순매수 상위 종목

```python
import urllib.request, re

HEADERS = {'User-Agent': 'Mozilla/5.0','Accept-Language': 'ko-KR,ko;q=0.9','Referer': 'https://finance.naver.com/sise/sise_deal_rank.naver'}

url = 'https://finance.naver.com/sise/sise_deal_rank_iframe.naver?sosok=01&investor_gubun=1000&type=buy'
req = urllib.request.Request(url, headers=HEADERS)
with urllib.request.urlopen(req) as r:
    html = r.read().decode('euc-kr', errors='replace')

items = re.findall(
    r'code=(\d{6})[^>]*>(.*?)</a>.*?class="number">([\d,\-]+)</td>.*?class="number">([\d,\-]+)</td>',
    html, re.DOTALL
)
print('=== 기관 순매수 상위 (KOSPI) ===')
for code, name, price, amount in items[:10]:
    print(f'  {name.strip()} ({code}) | 현재가: {price} | 순매수: {amount}백만원')
```

---

## [Function 4] 거래량 급증 종목

```python
import urllib.request, re

HEADERS = {'User-Agent': 'Mozilla/5.0','Accept-Language': 'ko-KR,ko;q=0.9','Referer': 'https://finance.naver.com/'}

url = 'https://finance.naver.com/sise/sise_quant.naver?sosok=0'
req = urllib.request.Request(url, headers=HEADERS)
with urllib.request.urlopen(req) as r:
    html = r.read().decode('euc-kr', errors='replace')

items = re.findall(
    r'code=(\d{6})[^>]*class="tltle">(.*?)</a>.*?class="number">([\d,]+)</td>.*?class="number">([\d,]+)</td>',
    html, re.DOTALL
)
print('=== 거래량 급증 종목 (KOSPI) ===')
for code, name, price, volume in items[:10]:
    print(f'  {name.strip()} ({code}) | 현재가: {price} | 거래량: {volume}')
```

---

## [Function 5] 종목 일별시세 (현재가·등락률 확인)

```python
import urllib.request, re

HEADERS = {'User-Agent': 'Mozilla/5.0','Accept-Language': 'ko-KR,ko;q=0.9','Referer': 'https://finance.naver.com/'}

def get_stock_price(code):
    url = f'https://finance.naver.com/item/sise_day.naver?code={code}'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        html = r.read().decode('euc-kr', errors='replace')
    rows = re.findall(
        r'(\d{4}\.\d{2}\.\d{2}).*?<span class="tah p11">([\d,]+)</span>.*?<span class="tah p11">([\d,]+)</span>.*?<span class="tah p11">([\d,]+)</span>',
        html[:5000], re.DOTALL
    )
    if rows:
        date, close, open_, volume = rows[0]
        print(f'종목: {code} | 날짜: {date} | 종가: {close} | 시가: {open_} | 거래량: {volume}')

# 사용 예시
get_stock_price('012450')  # 한화에어로스페이스
get_stock_price('000660')  # SK하이닉스
```

**출력 예시:**
```
종목: 012450 | 날짜: 2026.04.14 | 종가: 1,523,000 | 시가: 1,515,000 | 거래량: 1,531,000
```

---

## [Function 6] 종목 뉴스·공시 확인

```python
import urllib.request, re

HEADERS = {'User-Agent': 'Mozilla/5.0','Accept-Language': 'ko-KR,ko;q=0.9','Referer': 'https://finance.naver.com/'}

def get_stock_news(code, name):
    url = f'https://finance.naver.com/item/news_news.naver?code={code}&sm=title_entity_id.basic&clusterId='
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        html = r.read().decode('euc-kr', errors='replace')
    headlines = re.findall(r'class="tit"[^>]*>(.*?)</a>', html, re.DOTALL)
    cleaned = [re.sub(r'<[^>]+>', '', h).strip() for h in headlines]
    print(f'=== {name} ({code}) 최근 뉴스 ===')
    for h in cleaned[:5]:
        if h:
            print(f'  - {h}')

# 사용 예시
get_stock_news('012450', '한화에어로스페이스')
```

---

## ⚠️ Failover (Python 실행 불가 시)

Python Bash 실행이 불가한 경우 아래 대체 소스를 사용한다:

| 용도 | 대체 URL |
| :--- | :--- |
| 외국인+기관 동반 순매수 | `https://comp.fnguide.com/SVO2/json/data/NH/SUPPLY_TREND_WITH_BUY.json` (WebFetch) |
| 종목 상세 | `https://comp.fnguide.com/SVO2/ASP/SVD_Main.asp?gicode=AXXXXXX` (WebFetch) |
| 시황 요약 | WebSearch: `코스피 코스닥 {날짜} 마감 시황` |
