import urllib.request, re, os
from datetime import datetime
from html.parser import HTMLParser

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept-Language': 'ko-KR,ko;q=0.9',
    'Referer': 'https://finance.naver.com/'
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

TODAY = datetime.now().strftime("%y.%m.%d")  # 예: 26.04.22


def fetch_html(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read().decode('euc-kr', errors='replace')


def parse_investor_rank(html, label):
    """
    sise_deal_rank_iframe 페이지는 전일(좌) / 당일(우) 두 컬럼을 나란히 렌더링.
    날짜 헤더를 찾아 당일 컬럼만 파싱한다.

    페이지 구조: 날짜 헤더 두 개가 th 태그에 "yy.mm.dd" 형태로 존재.
    전일 데이터 블록이 먼저 나오고, 당일 데이터 블록이 그 뒤에 나온다.
    두 번째 날짜 헤더 이후 블록만 사용.
    """
    # 날짜 헤더 위치 파악 (ex: "26.04.21", "26.04.22")
    date_pattern = re.compile(r'\d{2}\.\d{2}\.\d{2}')
    dates_found = date_pattern.findall(html)
    unique_dates = list(dict.fromkeys(dates_found))  # 순서 유지 중복 제거

    # 당일 날짜 확인
    if TODAY not in unique_dates:
        # 당일 날짜가 없으면 가장 최근 날짜 사용 (장 마감 후 익일 조회 등)
        target_date = unique_dates[-1] if unique_dates else None
        warning = f"[주의] 당일({TODAY}) 데이터 없음 → {target_date} 데이터 사용"
    else:
        target_date = TODAY
        warning = None

    if warning:
        print(warning)

    # 당일 날짜 헤더가 두 번째로 등장하는 위치 이후만 파싱
    # (전일 블록을 건너뛰기 위해 target_date의 마지막 등장 이후 HTML 사용)
    if target_date:
        idx = html.rfind(target_date)
        html_today = html[idx:]
    else:
        html_today = html

    # 종목 코드 + 이름 + 금액 추출
    items = re.findall(
        r'code=(\d{6})[^>]*>(.*?)</a>.*?class="number">([\d,\-]+)</td>.*?class="number">([\d,\-]+)</td>',
        html_today, re.DOTALL
    )

    lines = [f"=== {label} [{target_date}] ==="]
    for code, name, qty, amount in items[:10]:
        lines.append(f"{name.strip()} ({code}) | 수량(천주): {qty} | 금액(백만원): {amount}")
    return lines


def fetch_data():
    results = []
    today_str = datetime.now().strftime("%Y-%m-%d")
    results.append(f"[조회 기준일: {today_str} / 당일({TODAY}) 컬럼 우선 파싱]\n")

    # 외국인 순매수 KOSPI
    html = fetch_html('https://finance.naver.com/sise/sise_deal_rank_iframe.naver?sosok=01&investor_gubun=9000&type=buy')
    results.extend(parse_investor_rank(html, "Foreign Buy Top (KOSPI)"))
    results.append("")

    # 외국인 순매수 KOSDAQ
    html = fetch_html('https://finance.naver.com/sise/sise_deal_rank_iframe.naver?sosok=02&investor_gubun=9000&type=buy')
    results.extend(parse_investor_rank(html, "Foreign Buy Top (KOSDAQ)"))
    results.append("")

    # 기관 순매수 KOSPI
    html = fetch_html('https://finance.naver.com/sise/sise_deal_rank_iframe.naver?sosok=01&investor_gubun=1000&type=buy')
    results.extend(parse_investor_rank(html, "Institution Buy Top (KOSPI)"))
    results.append("")

    # 거래량 상위 (당일 기준, 단일 컬럼 — 날짜 이슈 없음)
    html = fetch_html('https://finance.naver.com/sise/sise_quant.naver?sosok=0')
    items = re.findall(
        r'code=(\d{6})[^>]*class="tltle">(.*?)</a>.*?class="number">([\d,]+)</td>.*?class="number">([\d,]+)</td>',
        html, re.DOTALL
    )
    results.append(f"=== Volume Quant Top (KOSPI) [{today_str}] ===")
    for code, name, price, volume in items[:10]:
        results.append(f"{name.strip()} ({code}) | 현재가: {price} | 거래량: {volume}")

    output_path = os.path.join(SCRIPT_DIR, 'stocks_data.txt')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(results))

    # 콘솔 출력
    print('\n'.join(results))


fetch_data()
