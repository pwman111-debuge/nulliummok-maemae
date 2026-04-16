import urllib.request, re

HEADERS = {'User-Agent': 'Mozilla/5.0','Accept-Language': 'ko-KR,ko;q=0.9','Referer': 'https://finance.naver.com/'}

def get_stock_details(code, name):
    # Function 5: Daily price
    url_p = f'https://finance.naver.com/item/sise_day.naver?code={code}'
    req_p = urllib.request.Request(url_p, headers=HEADERS)
    with urllib.request.urlopen(req_p) as r:
        html_p = r.read().decode('euc-kr', errors='replace')
    rows = re.findall(
        r'(\d{4}\.\d{2}\.\d{2}).*?<span class="tah p11">([\d,]+)</span>.*?<span class="tah p11">([\d,]+)</span>.*?<span class="tah p11">([\d,]+)</span>',
        html_p[:5000], re.DOTALL
    )
    
    # Function 6: News
    url_n = f'https://finance.naver.com/item/news_news.naver?code={code}&sm=title_entity_id.basic&clusterId='
    req_n = urllib.request.Request(url_n, headers=HEADERS)
    with urllib.request.urlopen(req_n) as r:
        html_n = r.read().decode('euc-kr', errors='replace')
    headlines = re.findall(r'class="tit"[^>]*>(.*?)</a>', html_n, re.DOTALL)
    cleaned_news = [re.sub(r'<[^>]+>', '', h).strip() for h in headlines]

    res = f"=== {name} ({code}) ===\n"
    if rows:
        for i, row in enumerate(rows[:5]):
            res += f"  Day {i+1}: Date {row[0]}, Close {row[1]}, Open {row[2]}, Vol {row[3]}\n"
    res += f"  Recent News: {cleaned_news[:3]}\n"
    return res

stocks = [
    ('000660', 'SK하이닉스'),
    ('267260', 'HD현대일렉트릭'),
    ('012450', '한화에어로스페이스'),
    ('062040', '산일전기'),
    ('257720', '실리콘투')
]

final_results = []
for code, name in stocks:
    final_results.append(get_stock_details(code, name))

with open('.agent/scratch/stock_details.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(final_results))
