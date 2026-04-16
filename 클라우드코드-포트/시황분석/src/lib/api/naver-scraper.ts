/**
 * KRX Intelligence - 마켓 데이터 수집 모듈 (네이버 증권 기반)
 */

import { MarketData } from './market-api';

const NAVER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://m.stock.naver.com/marketindex/',
    'Origin': 'https://m.stock.naver.com',
};

// ────────────────────────────────────────────
// 네이버 증권 데이터 수집 (지수, 환율, 수급)
// ────────────────────────────────────────────

interface NaverIndexResponse {
    closePrice: string;
    compareToPreviousClosePrice: string;
    compareToPreviousPrice: { name: string };
    fluctuationsRatio: string;
}

async function fetchNaverIndex(code: string, displayName: string): Promise<any> {
    const url = `https://m.stock.naver.com/api/index/${code}/basic`;
    const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[Naver] HTTP ${res.status} – ${code}`);
    const data: NaverIndexResponse = await res.json();

    const direction = data.compareToPreviousPrice?.name ?? 'SAME';
    const isUp = direction === 'RISING' || direction === 'UPPER_LIMIT';
    const isDown = direction === 'FALLING' || direction === 'LOWER_LIMIT';
    const status = isUp ? 'up' : isDown ? 'down' : 'steady';
    const sign = isUp ? '+' : isDown ? '-' : '';

    return {
        name: displayName,
        value: data.closePrice,
        change: `${sign}${data.compareToPreviousClosePrice.replace(/^[+-]/, '')}`,
        percent: `${sign}${data.fluctuationsRatio.replace(/^[+-]/, '')}%`,
        status,
    };
}

// ────────────────────────────────────────────
// 네이버 해외 지수 데이터 수집 (나스닥, S&P 500 등)
// ────────────────────────────────────────────
async function fetchNaverWorldIndex(code: string, displayName: string): Promise<any> {
    const url = `https://api.stock.naver.com/index/${code}/basic`;
    const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[Naver World] HTTP ${res.status} – ${code}`);
    const data: NaverIndexResponse = await res.json();

    const direction = data.compareToPreviousPrice?.name ?? 'SAME';
    const isUp = direction === 'RISING' || direction === 'UPPER_LIMIT';
    const isDown = direction === 'FALLING' || direction === 'LOWER_LIMIT';
    const status = isUp ? 'up' : isDown ? 'down' : 'steady';
    const sign = isUp ? '+' : isDown ? '-' : '';

    return {
        name: displayName,
        value: data.closePrice,
        change: `${sign}${data.compareToPreviousClosePrice.replace(/^[+-]/, '')}`,
        percent: `${sign}${data.fluctuationsRatio.replace(/^[+-]/, '')}%`,
        status,
    };
}

async function fetchVix(): Promise<any> {
    const url = 'https://api.stock.naver.com/index/.VIX/basic';
    const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[Naver] HTTP ${res.status} – VIX`);
    const data = await res.json();

    const direction = data.compareToPreviousPrice?.name ?? 'SAME';
    const isUp = direction === 'RISING' || direction === 'UPPER_LIMIT';
    const isDown = direction === 'FALLING' || direction === 'LOWER_LIMIT';
    const status = isUp ? 'up' : isDown ? 'down' : 'steady';
    const sign = isUp ? '+' : isDown ? '-' : '';

    return {
        name: 'VIX',
        value: data.closePrice,
        change: `${sign}${data.compareToPreviousClosePrice.replace(/^[+-]/, '')}`,
        percent: `${sign}${data.fluctuationsRatio.replace(/^[+-]/, '')}%`,
        status,
    };
}

async function fetchNaverMarketMajors(): Promise<Map<string, any>> {
    const timestamp = Date.now();
    const url = `https://m.stock.naver.com/front-api/marketIndex/majors?_=${timestamp}`;
    const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[Naver Majors] HTTP ${res.status}`);
    const data = await res.json();
    const result = data.result;

    const map = new Map();

    const processItem = (item: any) => {
        if (!item || !item.closePrice) return;

        const direction = item.fluctuationsType?.name ?? 'SAME';
        const isUp = direction === 'RISING' || direction === 'UPPER_LIMIT';
        const isDown = direction === 'FALLING' || direction === 'LOWER_LIMIT';
        const status = isUp ? 'up' : isDown ? 'down' : 'steady';
        const sign = isUp ? '+' : isDown ? '-' : '';

        const processed = {
            value: item.closePrice,
            change: `${sign}${item.fluctuations?.replace(/^[+-]/, '') || '0.00'}`,
            percent: `${sign}${item.fluctuationsRatio?.replace(/^[+-]/, '') || '0.00'}%`,
            status,
        };

        // 이름 또는 심볼코드로 맵에 저장
        if (item.name) map.set(item.name, processed);
        if (item.symbolCode) map.set(item.symbolCode, processed);
        if (item.reutersCode) map.set(item.reutersCode, processed);

        // 특정 명칭 매핑 (앱에서 사용하는 displayName과 일치시키기 위함)
        if (item.symbolCode === 'USD') map.set('USD/KRW', processed);
        if (item.name === 'WTI' || item.symbolCode === 'CL') map.set('WTI 유가', processed);
        if (item.name === '국제 금' || item.symbolCode === 'GC') map.set('국제 금', processed);
    };

    if (result.majors) result.majors.forEach(processItem);
    if (result.exchange) result.exchange.forEach(processItem);
    if (result.energy) result.energy.forEach(processItem);
    if (result.metals) result.metals.forEach(processItem);

    return map;
}

async function fetchNaverMarketIndex(category: string, code: string, displayName: string, majorsMap?: Map<string, any>): Promise<any> {
    // 1. majorsMap에 이미 데이터가 있다면 그것을 사용 (최우선)
    if (majorsMap) {
        // reutersCode 또는 displayName으로 찾기
        const data = majorsMap.get(code) || majorsMap.get(displayName);
        if (data) {
            console.log(`[naver-scraper] ${displayName} (${code}) majors API에서 추출 성공: ${data.value}`);
            return { name: displayName, ...data };
        }
    }

    // 2. 없거나 실패했다면 기존처럼 개별 API 호출 (폴백)
    try {
        const timestamp = Date.now();
        const url = `https://m.stock.naver.com/front-api/marketIndex/productDetail?category=${category}&reutersCode=${code}&_=${timestamp}`;
        const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const result = data.result;

        if (!result) throw new Error(`No result data`);

        const direction = result.fluctuationsType?.name ?? 'SAME';
        const isUp = direction === 'RISING' || direction === 'UPPER_LIMIT';
        const isDown = direction === 'FALLING' || direction === 'LOWER_LIMIT';
        const status = isUp ? 'up' : isDown ? 'down' : 'steady';
        const sign = isUp ? '+' : isDown ? '-' : '';

        console.log(`[naver-scraper] ${displayName} (${code}) 개별 API 수집 성공: ${result.closePrice}`);

        return {
            name: displayName,
            value: result.closePrice,
            change: `${sign}${result.fluctuations.replace(/^[+-]/, '')}`,
            percent: `${sign}${result.fluctuationsRatio.replace(/^[+-]/, '')}%`,
            status,
        };
    } catch (err) {
        console.warn(`[naver-scraper] ${displayName} (${code}) 수집 실패:`, err instanceof Error ? err.message : err);
        throw err;
    }
}

async function fetchInvestorSupply(): Promise<any[]> {
    try {
        const url = 'https://m.stock.naver.com/api/index/KOSPI/trend';
        const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
        const data = await res.json();

        const parse = (raw: string) => {
            if (!raw) return { value: '0억', status: 'steady' as const };
            const num = parseInt(raw.replace(/,/g, ''), 10);
            return { value: `${raw}억`, status: num > 0 ? 'up' as const : num < 0 ? 'down' as const : 'steady' as const };
        };

        return [
            { name: '개인', ...parse(data?.personalValue) },
            { name: '외국인', ...parse(data?.foreignValue) },
            { name: '기관', ...parse(data?.institutionalValue) },
        ];
    } catch (err) {
        console.error('[naver-scraper] 수급 데이터 수집 실패:', err);
        return [];
    }
}

async function fetchNaverBondYield(symbol: string, displayName: string): Promise<any> {
    const url = `https://stock.naver.com/api/securityService/economic/bond/${symbol}`;
    const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[Naver Bond] HTTP ${res.status} – ${symbol}`);
    const data = await res.json();

    const value = data.closePriceYield;
    const diff = data.yieldChange;
    const percent = data.yieldChangePercent;

    const status = diff > 0 ? 'up' : diff < 0 ? 'down' : 'steady';
    const sign = status === 'up' ? '+' : status === 'down' ? '-' : '';

    return {
        name: displayName,
        value: value.toFixed(3),
        change: `${sign}${Math.abs(diff).toFixed(3)}`,
        percent: `${sign}${Math.abs(percent).toFixed(2)}%`,
        status,
        rawClose: value,
        rawChange: diff
    };
}

/** 장단기 금리차 계산 */
function calculateSpread(long: any, short: any, displayName: string): any {
    const spread = long.rawClose - short.rawClose;
    const prevSpread = (long.rawClose - long.rawChange) - (short.rawClose - short.rawChange);
    const change = spread - prevSpread;
    const sign = change > 0 ? '+' : '';

    return {
        name: displayName,
        value: spread.toFixed(3),
        change: `${sign}${change.toFixed(3)}`,
        percent: '',
        status: spread >= 0 ? 'up' : 'down'
    };
}

function getKoreaTimeString(): string {
    const now = new Date();
    const korea = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    return korea.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) + ' KST';
}

export async function fetchNaverMarketData(): Promise<MarketData> {
    // 1. majors API 먼저 호출하여 통합 데이터 확보
    let majorsMap: Map<string, any> | undefined;
    try {
        majorsMap = await fetchNaverMarketMajors();
    } catch (err) {
        console.error('[naver-scraper] majors API 호출 실패, 개별 API로 폴백합니다.', err);
    }

    const [kospi, kosdaq, kospi200, nasdaq, sp500, usdkrw, supply, wti, gold, us10y, us2y, kr10y, kr2y, vix] = await Promise.allSettled([
        fetchNaverIndex('KOSPI', 'KOSPI'),
        fetchNaverIndex('KOSDAQ', 'KOSDAQ'),
        fetchNaverIndex('KPI200', 'KOSPI 200'),
        fetchNaverWorldIndex('.IXIC', '나스닥 지수'),
        fetchNaverWorldIndex('.INX', 'S&P 500'),
        fetchNaverMarketIndex('exchange', 'FX_USDKRW', 'USD/KRW', majorsMap),
        fetchInvestorSupply(),
        fetchNaverMarketIndex('energy', 'CLcv1', 'WTI 유가', majorsMap),
        fetchNaverMarketIndex('metals', 'GCcv1', '국제 금', majorsMap),
        fetchNaverBondYield('US10YT=RR', '미국채 10년'),
        fetchNaverBondYield('US2YT=RR', '미국채 2년'),
        fetchNaverBondYield('KR10YT=RR', '한국채 10년'),
        fetchNaverBondYield('KR2YT=RR', '한국채 2년'),
        fetchVix(),
    ]);

    const indices: any[] = [];
    [kospi, kosdaq, kospi200, nasdaq, sp500, usdkrw, wti, gold, us10y, us2y, kr10y, kr2y].forEach(r => {
        if (r.status === 'fulfilled') indices.push(r.value);
    });

    const yieldSpreads: any[] = [];
    if (us10y.status === 'fulfilled' && us2y.status === 'fulfilled') {
        yieldSpreads.push(calculateSpread(us10y.value, us2y.value, '미 장단기 금리차'));
    }
    if (kr10y.status === 'fulfilled' && kr2y.status === 'fulfilled') {
        yieldSpreads.push(calculateSpread(kr10y.value, kr2y.value, '한 장단기 금리차'));
    }

    return {
        indices,
        supply: supply.status === 'fulfilled' ? supply.value : [],
        yieldSpreads,
        vix: vix.status === 'fulfilled' ? vix.value : undefined,
        lastUpdated: `${getKoreaTimeString()} (네이버 실시간)`,
    };
}

