"""
네이버 증권 데이터 수집 스크립트
사용법: python fetch_naver.py [ticker]
예시:  python fetch_naver.py 005930
"""

import sys
import io
import re
import json
import requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://finance.naver.com/'
}

def fetch_step1_basic(ticker):
    """1-A: 현재가, 시가총액, 52주 고저, 수급 기초 데이터"""
    url = f'https://m.stock.naver.com/api/stock/{ticker}/integration'
    r = requests.get(url, headers=HEADERS, timeout=10)
    r.encoding = 'utf-8'
    data = r.json()

    print("=" * 50)
    print("[ 1-A ] 현재가 & 시가총액")
    print("=" * 50)
    for item in data.get('totalInfos', []):
        print(f"  {item['key']}: {item['value']}")

    print()
    print("[ 3-A ] 최근 5일 수급 동향 (외국인/기관)")
    print("-" * 50)
    for d in data.get('dealTrendInfos', []):
        print(f"  {d['bizdate']}  외국인: {d['foreignerPureBuyQuant']}  기관: {d['organPureBuyQuant']}  외인보유율: {d['foreignerHoldRatio']}")

    print()
    print("[ 2-B ] 최근 증권사 리포트")
    print("-" * 50)
    for r2 in data.get('researches', []):
        print(f"  [{r2['wdt']}] {r2['bnm']}: {r2['tit']}")

    return data


def fetch_step1_financial(ticker):
    """1-B: 연간 재무 테이블 (매출액/영업이익/ROE/PER/PBR 등)"""
    url = f'https://m.stock.naver.com/api/stock/{ticker}/finance/annual'
    r = requests.get(url, headers=HEADERS, timeout=10)
    r.encoding = 'utf-8'
    data = r.json()
    fi = data['financeInfo']

    periods = [t['key'] for t in fi['trTitleList']]
    labels = {t['key']: t['title'] + ('(E)' if t['isConsensus'] == 'Y' else '(A)') for t in fi['trTitleList']}

    target_items = ['매출액', '영업이익', '당기순이익', '영업이익률', 'ROE', 'EPS', 'PER', 'PBR', '부채비율', '배당수익률']

    print()
    print("=" * 50)
    print("[ 1-B ] 기업실적분석 테이블")
    print("=" * 50)
    header = "| 항목 | " + " | ".join(labels[p] for p in periods) + " |"
    sep    = "| :--- | " + " | ".join(":---:" for _ in periods) + " |"
    print(header)
    print(sep)

    for row in fi['rowList']:
        title = row['title']
        if any(t in title for t in target_items):
            vals = [row['columns'].get(p, {}).get('value', '-') or '-' for p in periods]
            print(f"| **{title}** | " + " | ".join(vals) + " |")

    print()
    print("> **데이터 출처:** 네이버 증권 공식 기업실적분석 데이터 기반. 전망치(E)는 컨센서스 기준이며 실제 결과와 다를 수 있습니다.")


def fetch_step2_consensus(ticker):
    """2-A: 컨센서스 목표주가, 투자의견"""
    url = f'https://finance.naver.com/item/coinfo.naver?code={ticker}&target=con'
    r = requests.get(url, headers=HEADERS, timeout=10)
    r.encoding = 'euc-kr'
    html = r.text

    print()
    print("=" * 50)
    print("[ 2-A ] 컨센서스 목표주가 & 투자의견")
    print("=" * 50)

    high_low = re.search(r'최고<span class="bar">l</span>최저.*?<em>([\d,]+)</em>.*?<em>([\d,]+)</em>', html, re.DOTALL)
    if high_low:
        print(f"  목표주가 최고: {high_low.group(1)}원")
        print(f"  목표주가 최저: {high_low.group(2)}원")

    opinion = re.search(r'투자의견.*?<em>([\d\.]+)</em>(.*?)</span>', html, re.DOTALL)
    if opinion:
        print(f"  투자의견: {opinion.group(1)}점 / {opinion.group(2).strip()}")

    avg = re.search(r'평균</th>\s*<td[^>]*>\s*(?:<[^>]+>)*\s*([\d,]+)\s*(?:</[^>]+>)*\s*</td>', html, re.DOTALL)
    if avg:
        print(f"  목표주가 평균: {avg.group(1)}원")
    else:
        # 대안: integration API의 totalInfos에서 추정PER 기반으로 표기
        print("  목표주가 평균: 컨센서스 페이지에서 직접 확인 필요")

    # 증권사 수 카운트
    brokers = re.findall(r'class="source">(.*?)</td>', html)
    if brokers:
        print(f"  참여 증권사 수: {len(brokers)}곳")
        for b in brokers[:10]:
            print(f"    - {b.strip()}")


def fetch_step3_supply(ticker):
    """3-B: 공시 수집"""
    url = f'https://finance.naver.com/item/dsclose.naver?code={ticker}'
    r = requests.get(url, headers=HEADERS, timeout=10)
    r.encoding = 'euc-kr'
    html = r.text

    print()
    print("=" * 50)
    print("[ 3-B ] 최근 공시")
    print("=" * 50)

    disclosures = re.findall(
        r'<td class="title">.*?<a[^>]+>(.*?)</a>.*?<td[^>]*>([\d\.]+)</td>',
        html, re.DOTALL
    )
    if disclosures:
        for title, date in disclosures[:5]:
            clean = re.sub(r'<[^>]+>', '', title).strip()
            print(f"  [{date}] {clean}")
    else:
        print("  최근 주요 공시 없음")


if __name__ == '__main__':
    ticker = sys.argv[1] if len(sys.argv) > 1 else '005930'
    print(f"\n🚀 [제네시스] 네이버 증권 데이터 수집: {ticker}\n")
    fetch_step1_basic(ticker)
    fetch_step1_financial(ticker)
    fetch_step2_consensus(ticker)
    fetch_step3_supply(ticker)
    print("\n✅ 데이터 수집 완료\n")
