/**
 * KRX Intelligence - 경제 캘린더 데이터
 * 실제 운영 시에는 Investing.com 또는 토스 증권 등에서 자동 수집합니다.
 */

import { fetchTossCalendarData } from './toss-calendar-scraper';

export interface EconomicEvent {
    id: string;
    title: string;
    date: string;           // YYYY-MM-DD
    time?: string;          // HH:mm KST
    country: 'KR' | 'US' | 'EU' | 'JP' | 'CN';
    countryName: string;
    importance: 'high' | 'medium' | 'low';
    category: 'employment' | 'inflation' | 'interest_rate' | 'gdp' | 'trade' | 'manufacturing' | 'housing' | 'earnings' | 'other';
    categoryName: string;
    previous?: string;
    forecast?: string;
    actual?: string;
    description?: string;
}

const FLAG: Record<string, string> = {
    KR: '🇰🇷', US: '🇺🇸', EU: '🇪🇺', JP: '🇯🇵', CN: '🇨🇳',
};

/** 캐시 TTL: 6시간 (경제 캘린더는 자주 바뀌지 않음) */
const CALENDAR_CACHE_TTL = 6 * 60 * 60 * 1000;

let cachedEvents: EconomicEvent[] = [];
let lastFetchedTimestamp = 0;

/**
 * 모든 경제 이벤트를 가져옵니다. (캐시 적용)
 */
async function getAllEvents(): Promise<EconomicEvent[]> {
    const isStale = Date.now() - lastFetchedTimestamp > CALENDAR_CACHE_TTL;
    
    if (isStale || cachedEvents.length === 0) {
        try {
            console.log('[economic-calendar] 캐시 만료 → 토스 증권 데이터 수집 시작');
            const fresh = await fetchTossCalendarData();
            
            if (fresh.length > 0) {
                cachedEvents = fresh;
                lastFetchedTimestamp = Date.now();
                console.log(`[economic-calendar] 데이터 갱신 완료: ${fresh.length}건`);
            } else {
                console.warn('[economic-calendar] 토스 증권 캘린더 데이터가 비어 있습니다. (상태 점검 등). 5분 후 재시도합니다.');
                // 기존 캐시를 유지하되, 5분 후 다시 수집하도록 타임스탬프 조작
                lastFetchedTimestamp = Date.now() - CALENDAR_CACHE_TTL + (5 * 60 * 1000);
            }
        } catch (err) {
            console.error('[economic-calendar] 실시간 수집 실패:', err);
            lastFetchedTimestamp = Date.now() - CALENDAR_CACHE_TTL + (5 * 60 * 1000);
        }
    }
    
    return cachedEvents;
}

/**
 * 특정 기간의 경제 이벤트를 반환합니다.
 */
export async function getEconomicEvents(options?: {
    from?: string;
    to?: string;
    country?: string;
    importance?: 'high' | 'medium' | 'low';
}): Promise<EconomicEvent[]> {
    const allEvents = await getAllEvents();
    let filtered = [...allEvents];

    if (options?.from) {
        filtered = filtered.filter(e => e.date >= options.from!);
    }
    if (options?.to) {
        filtered = filtered.filter(e => e.date <= options.to!);
    }
    if (options?.country) {
        filtered = filtered.filter(e => e.country === options.country);
    }
    if (options?.importance) {
        filtered = filtered.filter(e => e.importance === options.importance);
    }

    return filtered.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));
}

/**
 * 다음 주요(High Importance) 이벤트를 반환합니다.
 */
export async function getNextHighImpactEvent(): Promise<EconomicEvent | null> {
    const allEvents = await getAllEvents();
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const upcoming = allEvents
        .filter(e => e.date >= today && e.importance === 'high')
        .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming[0] ?? null;
}

/**
 * 국기 이모지를 반환합니다.
 */
export function getFlag(country: string): string {
    return FLAG[country] ?? '🌐';
}
