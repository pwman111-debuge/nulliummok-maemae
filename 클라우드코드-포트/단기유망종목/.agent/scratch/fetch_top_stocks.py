import urllib.request, re

HEADERS = {'User-Agent': 'Mozilla/5.0','Accept-Language': 'ko-KR,ko;q=0.9','Referer': 'https://finance.naver.com/'}

def fetch_data():
    results = []
    
    # Function 2
    for market, sosok in [('KOSPI', '01'), ('KOSDAQ', '02')]:
        url = f'https://finance.naver.com/sise/sise_deal_rank_iframe.naver?sosok={sosok}&investor_gubun=9000&type=buy'
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req) as r:
            html = r.read().decode('euc-kr', errors='replace')
        items = re.findall(
            r'code=(\d{6})[^>]*>(.*?)</a>.*?class="number">([\d,\-]+)</td>.*?class="number">([\d,\-]+)</td>',
            html, re.DOTALL
        )
        results.append(f"=== Foreign Buy Top ({market}) ===")
        for code, name, price, amount in items[:10]:
            results.append(f"{name.strip()} ({code}) | Price: {price} | Amount: {amount}")

    # Function 3
    url = 'https://finance.naver.com/sise/sise_deal_rank_iframe.naver?sosok=01&investor_gubun=1000&type=buy'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        html = r.read().decode('euc-kr', errors='replace')
    items = re.findall(
        r'code=(\d{6})[^>]*>(.*?)</a>.*?class="number">([\d,\-]+)</td>.*?class="number">([\d,\-]+)</td>',
        html, re.DOTALL
    )
    results.append("\n=== Institution Buy Top (KOSPI) ===")
    for code, name, price, amount in items[:10]:
        results.append(f"{name.strip()} ({code}) | Price: {price} | Amount: {amount}")

    # Function 4
    url = 'https://finance.naver.com/sise/sise_quant.naver?sosok=0'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        html = r.read().decode('euc-kr', errors='replace')
    items = re.findall(
        r'code=(\d{6})[^>]*class="tltle">(.*?)</a>.*?class="number">([\d,]+)</td>.*?class="number">([\d,]+)</td>',
        html, re.DOTALL
    )
    results.append("\n=== Volume Quant Top (KOSPI) ===")
    for code, name, price, volume in items[:10]:
        results.append(f"{name.strip()} ({code}) | Price: {price} | Volume: {volume}")

    with open('.agent/scratch/stocks_data.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(results))

fetch_data()
