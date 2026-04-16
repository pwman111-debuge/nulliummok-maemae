import urllib.request, re

HEADERS = {'User-Agent': 'Mozilla/5.0','Accept-Language': 'ko-KR,ko;q=0.9','Referer': 'https://finance.naver.com/'}

for code in ['KOSPI', 'KOSDAQ']:
    url = f'https://finance.naver.com/sise/sise_index_day.naver?code={code}'
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as r:
            html = r.read().decode('euc-kr', errors='replace')
        rows = re.findall(r'(\d{4}\.\d{2}\.\d{2}).*?([\d,]+\.\d+)', html, re.DOTALL)
        if rows:
            print(f'{code} | {rows[0][0]} | {rows[0][1]}')
        else:
            print(f'{code} | No data found')
    except Exception as e:
        print(f'{code} | Error: {e}')
