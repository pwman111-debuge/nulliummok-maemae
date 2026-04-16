"""
네이버 증권 데이터 수집 스크립트 - 제네시스 워크플로우용
사용법: python naver_finance.py [명령] [인자]

명령:
  market              - 1단계: 시장 국면 (KOSPI/KOSDAQ 지수)
  sector              - 1단계: 업종별 시세 상위/하위
  theme               - 1단계: 테마별 시세
  stock [종목코드]    - 2단계: 종목 기본 정보 + 현재가
  investor [종목코드] - 3단계: 투자자별 매매동향
  short [종목코드]    - 3단계: 공매도 현황
  screen [업종번호]   - 2단계: 업종 내 종목 리스트
  all [종목코드]      - 전체: 종목 종합 분석 데이터

예시:
  python naver_finance.py market
  python naver_finance.py stock 005930
  python naver_finance.py sector
  python naver_finance.py all 005930
"""

import sys
import io
import ssl
import json
import re
from datetime import datetime

import requests
from bs4 import BeautifulSoup

# Windows 터미널 한글 출력 설정
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ── 공통 설정 ──────────────────────────────────────────────
SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://finance.naver.com/",
    "Accept-Language": "ko-KR,ko;q=0.9",
})
SESSION.verify = False

MOBILE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://m.stock.naver.com/",
    "Accept": "application/json",
}

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def fetch_json_mobile(url):
    resp = requests.get(url, headers=MOBILE_HEADERS, verify=False, timeout=10)
    resp.raise_for_status()
    return resp.json()


def fetch_html_pc(url, encoding="euc-kr"):
    resp = SESSION.get(url, timeout=10)
    resp.encoding = encoding
    return BeautifulSoup(resp.text, "html.parser")


def divider(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


# ── 1단계: 시장 국면 ───────────────────────────────────────
def cmd_market():
    divider("1단계 - 시장 국면 (KOSPI / KOSDAQ)")
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"조회 시각: {now}\n")

    for index_code in ["KOSPI", "KOSDAQ"]:
        try:
            d = fetch_json_mobile(f"https://m.stock.naver.com/api/index/{index_code}/basic")
            direction = "▲" if d.get("compareToPreviousPrice", {}).get("name") == "RISING" else "▼"
            print(f"[{index_code}]")
            print(f"  현재가:  {d.get('closePrice', 'N/A')}")
            print(f"  등락:    {direction} {d.get('compareToPreviousClosePrice', 'N/A')} ({d.get('fluctuationsRatio', 'N/A')}%)")
            print(f"  상태:    {d.get('marketStatus', 'N/A')}")
            print()
        except Exception as e:
            print(f"[{index_code}] 오류: {e}")

    # 시장 국면 판단 힌트
    print("※ 시장 국면 판단은 위 수치 + 이평선 위치를 종합해 판단하세요")
    print("  (상승추세 초입 / 상승추세 지속 / 조정 중 / 하락추세)")


# ── 1단계: 업종별 시세 ─────────────────────────────────────
def cmd_sector():
    divider("1단계 - 업종별 시세 (KOSPI + KOSDAQ)")
    url = "https://finance.naver.com/sise/sise_group.naver?type=upjong"
    try:
        soup = fetch_html_pc(url)
        rows = soup.select("table.type_1 tr")
        sectors = []
        for row in rows:
            cols = row.select("td")
            if len(cols) < 4:
                continue
            name_tag = cols[0].find("a")
            if not name_tag:
                continue
            name = name_tag.get_text(strip=True)
            href = name_tag.get("href", "")
            no_match = re.search(r"no=(\d+)", href)
            sector_no = no_match.group(1) if no_match else ""
            # col[0]=업종명, col[1]=등락률, col[2]=전체, col[3]=상승, col[4]=보합, col[5]=하락
            chg_text = cols[1].get_text(strip=True) if len(cols) > 1 else ""
            total     = cols[2].get_text(strip=True) if len(cols) > 2 else ""
            rising    = cols[3].get_text(strip=True) if len(cols) > 3 else ""
            falling   = cols[5].get_text(strip=True) if len(cols) > 5 else ""
            try:
                chg = float(chg_text.replace("+", "").replace("%", "").replace(",", ""))
            except ValueError:
                chg = 0
            sectors.append({
                "no": sector_no,
                "name": name,
                "change_pct": chg,
                "change_str": chg_text,
                "total": total,
                "rising": rising,
                "falling": falling,
            })

        if not sectors:
            print("업종 데이터를 파싱하지 못했습니다.")
            return

        sectors.sort(key=lambda x: x["change_pct"], reverse=True)
        print(f"{'순위':<4} {'업종명':<24} {'등락률':>8}  {'상승/하락/전체':>14}  {'번호'}")
        print("-" * 65)
        for i, s in enumerate(sectors[:10], 1):
            print(f"{i:<4} {s['name']:<24} {s['change_str']:>8}  {s['rising']}↑/{s['falling']}↓/{s['total']}  ({s['no']})")
        print()
        print("▼ 하위 업종 (약세)")
        print("-" * 65)
        for s in sectors[-5:]:
            print(f"     {s['name']:<24} {s['change_str']:>8}  {s['rising']}↑/{s['falling']}↓/{s['total']}")

    except Exception as e:
        print(f"업종 조회 오류: {e}")


# ── 1단계: 테마별 시세 ─────────────────────────────────────
def cmd_theme():
    divider("1단계 - 테마별 시세")
    url = "https://finance.naver.com/sise/sise_group.naver?type=theme"
    try:
        soup = fetch_html_pc(url)
        rows = soup.select("table.type_1 tr")
        themes = []
        for row in rows:
            cols = row.select("td")
            if len(cols) < 2:
                continue
            name_tag = cols[0].find("a")
            if not name_tag:
                continue
            name = name_tag.get_text(strip=True)
            values = [c.get_text(strip=True) for c in cols[1:3]]
            try:
                chg = float(values[1].replace(",", "").replace("%", "")) if len(values) > 1 else 0
            except ValueError:
                chg = 0
            themes.append({"name": name, "change_pct": chg})

        themes.sort(key=lambda x: x["change_pct"], reverse=True)
        print(f"{'순위':<4} {'테마명':<30} {'등락률':>8}")
        print("-" * 50)
        for i, t in enumerate(themes[:15], 1):
            sign = "+" if t["change_pct"] >= 0 else ""
            print(f"{i:<4} {t['name']:<30} {sign}{t['change_pct']:>6.2f}%")

    except Exception as e:
        print(f"테마 조회 오류: {e}")


# ── 2단계: 업종 내 종목 스크리닝 ───────────────────────────
def cmd_screen(sector_no):
    divider(f"2단계 - 업종({sector_no}) 내 종목 리스트")
    url = f"https://finance.naver.com/sise/sise_group_detail.naver?type=upjong&no={sector_no}"
    try:
        soup = fetch_html_pc(url)
        rows = soup.select("table.type_5 tr, table.type_3 tr")
        stocks = []
        for row in rows:
            cols = row.select("td")
            if len(cols) < 5:
                continue
            name_tag = cols[0].find("a")
            if not name_tag:
                continue
            name = name_tag.get_text(strip=True)
            code_match = re.search(r"code=(\d+)", name_tag.get("href", ""))
            code = code_match.group(1) if code_match else ""
            values = [c.get_text(strip=True) for c in cols[1:6]]
            stocks.append({"name": name, "code": code, "values": values})

        if not stocks:
            print("종목 데이터를 가져오지 못했습니다. 업종 번호를 확인하세요.")
            return

        print(f"{'종목명':<20} {'코드':<8} {'현재가':>10} {'등락률':>8}")
        print("-" * 55)
        for s in stocks[:20]:
            vals = s["values"]
            price = vals[0] if vals else ""
            chg   = vals[1] if len(vals) > 1 else ""
            print(f"{s['name']:<20} {s['code']:<8} {price:>10} {chg:>8}")

    except Exception as e:
        print(f"업종 종목 조회 오류: {e}")


# ── 2단계: 종목 기본 정보 ─────────────────────────────────
def cmd_stock(code):
    divider(f"2단계 - 종목 기본 정보 [{code}]")
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        d = fetch_json_mobile(f"https://m.stock.naver.com/api/stock/{code}/basic")
        direction = "▲" if d.get("compareToPreviousPrice", {}).get("name") == "RISING" else "▼"

        print(f"조회 시각:    {now}  ★ 현재가 기준 시각 확정")
        print(f"종목명:       {d.get('stockName', 'N/A')}")
        print(f"종목코드:     {d.get('itemCode', 'N/A')}")
        print(f"거래소:       {d.get('stockExchangeName', 'N/A')}")
        print(f"현재가:       {d.get('closePrice', 'N/A')} 원")
        print(f"등락:         {direction} {d.get('compareToPreviousClosePrice', 'N/A')} ({d.get('fluctuationsRatio', 'N/A')}%)")
        print(f"시장 상태:    {d.get('marketStatus', 'N/A')}")

        over = d.get("overMarketPriceInfo", {})
        if over:
            print(f"시간외 현재가: {over.get('overPrice', 'N/A')} ({over.get('fluctuationsRatio', 'N/A')}%)")

    except Exception as e:
        print(f"종목 기본 조회 오류: {e}")

    # 재무 정보 (PC 버전 HTML)
    print()
    print("[재무 정보 - 네이버 증권 종목분석]")
    try:
        soup = fetch_html_pc(f"https://finance.naver.com/item/main.naver?code={code}")

        # 영업이익, 순이익 등
        finance_rows = soup.select("table.tb_type1_ifrs tr, table.tb_type1 tr")
        for row in finance_rows[:8]:
            th = row.find("th")
            tds = row.select("td")
            if th and tds:
                label = th.get_text(strip=True)
                vals = [td.get_text(strip=True) for td in tds[:4]]
                if any(v for v in vals):
                    print(f"  {label:<20}: {' | '.join(vals)}")

    except Exception as e:
        print(f"  재무 정보 조회 오류: {e}")

    # 증권사 목표주가
    print()
    print("[증권사 투자의견 / 목표주가]")
    try:
        soup2 = fetch_html_pc(f"https://finance.naver.com/item/coinfo.naver?code={code}&target=cnc")
        opinion_rows = soup2.select("table.type_1 tr, .co_table tr")
        for row in opinion_rows[:6]:
            tds = row.select("td")
            if len(tds) >= 3:
                print(f"  {' | '.join(td.get_text(strip=True) for td in tds[:4])}")
    except Exception as e:
        print(f"  목표주가 조회 오류: {e}")


# ── 3단계: 투자자별 매매동향 ───────────────────────────────
def cmd_investor(code):
    divider(f"3단계 - 투자자별 매매동향 [{code}]")
    try:
        soup = fetch_html_pc(f"https://finance.naver.com/item/frgn.naver?code={code}")
        rows = soup.select("table.type2 tr, table.frgn_table tr")
        print(f"{'날짜':<12} {'종가':>10} {'외국인':>12} {'기관':>12} {'개인':>12}")
        print("-" * 65)
        count = 0
        for row in rows:
            cols = row.select("td")
            if len(cols) < 5:
                continue
            texts = [c.get_text(strip=True) for c in cols]
            # 날짜 패턴 있는 행만
            if re.match(r"\d{4}\.\d{2}\.\d{2}", texts[0]):
                print(f"  {' | '.join(texts[:5])}")
                count += 1
            if count >= 20:
                break

        if count == 0:
            # 대안: 직접 파싱
            all_text = soup.get_text()
            print("  (표 파싱 실패 - 페이지 직접 확인 권장)")
            print(f"  URL: https://finance.naver.com/item/frgn.naver?code={code}")

    except Exception as e:
        print(f"투자자 동향 조회 오류: {e}")


# ── 3단계: 공매도 현황 ─────────────────────────────────────
def cmd_short(code):
    divider(f"3단계 - 공매도 현황 [{code}]")
    try:
        soup = fetch_html_pc(
            f"https://finance.naver.com/item/short_sell.naver?code={code}",
            encoding="utf-8"
        )
        rows = soup.select("table tr")
        count = 0
        for row in rows:
            cols = row.select("td, th")
            if len(cols) >= 3:
                texts = [c.get_text(strip=True) for c in cols[:5]]
                if any(texts):
                    print("  " + " | ".join(texts))
                    count += 1
            if count >= 15:
                break
        if count == 0:
            print(f"  공매도 데이터 없음 또는 직접 확인 필요")
            print(f"  URL: https://finance.naver.com/item/short_sell.naver?code={code}")
    except Exception as e:
        print(f"공매도 조회 오류: {e}")


# ── 전체 종합 ─────────────────────────────────────────────
def cmd_all(code):
    cmd_stock(code)
    cmd_investor(code)
    cmd_short(code)
    print()
    divider("참고 링크")
    print(f"  종목분석:  https://finance.naver.com/item/main.naver?code={code}")
    print(f"  투자의견:  https://finance.naver.com/item/coinfo.naver?code={code}&target=cnc")
    print(f"  차트:      https://finance.naver.com/item/fchart.naver?code={code}")
    print(f"  공시:      https://dart.fss.or.kr/dsab007/main.do?option=S&textCrpNm={code}")
    print(f"  종목토론:  https://finance.naver.com/item/board.naver?code={code}")


# ── 메인 ──────────────────────────────────────────────────
if __name__ == "__main__":
    args = sys.argv[1:]

    if not args:
        print(__doc__)
        sys.exit(0)

    cmd = args[0].lower()

    if cmd == "market":
        cmd_market()
    elif cmd == "sector":
        cmd_sector()
    elif cmd == "theme":
        cmd_theme()
    elif cmd == "stock" and len(args) > 1:
        cmd_stock(args[1])
    elif cmd == "investor" and len(args) > 1:
        cmd_investor(args[1])
    elif cmd == "short" and len(args) > 1:
        cmd_short(args[1])
    elif cmd == "screen" and len(args) > 1:
        cmd_screen(args[1])
    elif cmd == "all" and len(args) > 1:
        cmd_all(args[1])
    else:
        print(f"알 수 없는 명령: {' '.join(args)}")
        print(__doc__)
