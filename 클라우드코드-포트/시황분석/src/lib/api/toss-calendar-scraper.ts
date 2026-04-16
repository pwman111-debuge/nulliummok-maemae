
/**
 * KRX Intelligence - 토스 증권 증시 캘린더 수집 모듈 (예측치 보강 버전)
 */

import { EconomicEvent } from './economic-calendar';

const TOSS_API_URL = 'https://wts-cert-api.tossinvest.com/api/v4/calendar/monthly';
const TOSS_DETAIL_API_URL = 'https://wts-cert-api.tossinvest.com/api/v4/calendar/economic-indicators';

const HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://www.tossinvest.com/calendar',
    'Origin': 'https://www.tossinvest.com'
};

interface TossEvent {
    id: {
        uniqueName: string;
        group: string;
    };
    view: {
        title: string;
        subtitle?: {
            text: string;
        };
        resourceUrl?: string;
        economicIndicatorValue?: {
            ric?: string;
            actual?: number;
            forecast?: number;
            historical?: number;
            unitPrefix?: string;
            time?: string;
        };
    };
    date: string;
    stockEarnings?: {
        companyName: string;
        eps?: number;
        salesDisplay?: string;
        epsSurpriseDisplay?: string;
    };
}

/**
 * 릭(RIC) 리스트를 기반으로 지표 상세 정보를 가져옵니다. (예측치 확보용)
 */
async function fetchTossIndicatorsDetail(rics: string[]): Promise<Record<string, any>> {
    if (rics.length === 0) return {};
    
    // 릭이 너무 많으면 API 제한이 있을 수 있으므로 나눠서 호출 (Toss는 대략 30~50개까지 가능할 것으로 추정)
    const url = `${TOSS_DETAIL_API_URL}?rics=${rics.join(',')}`;
    try {
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) return {};
        const data = await res.json();
        
        // RIC별로 맵 생성
        const map: Record<string, any> = {};
        if (data.result && Array.isArray(data.result)) {
            data.result.forEach((item: any) => {
                if (item.ric) map[item.ric] = item;
            });
        }
        return map;
    } catch (err) {
        console.error(`[Toss Scraper] Detail fetch error:`, err);
        return {};
    }
}

/**
 * 토스 증권 API에서 특정 월의 데이터를 가져옵니다.
 */
async function fetchTossMonthlyData(yearMonth: string): Promise<TossEvent[]> {
    const url = `${TOSS_API_URL}/${yearMonth}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({}),
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`[Toss Scraper] API error status: ${res.status} for ${yearMonth}`);
            return [];
        }

        const data = await res.json();
        return data.result?.events || [];
    } catch (err) {
        console.error(`[Toss Scraper] Fetch error for ${yearMonth}:`, err);
        return [];
    }
}

/**
 * 토스 이벤트를 우리 앱의 EconomicEvent 형식으로 변환합니다.
 * @param detailsMap 상세 API에서 가져온 추가 데이터 (예측치 포함)
 */
function mapTossEvent(toss: TossEvent, detailsMap: Record<string, any>): EconomicEvent {
    const group = toss.id.group;
    const title = toss.view.title;
    const date = toss.date;
    const subtitle = toss.view.subtitle?.text || '';

    let country: 'KR' | 'US' | 'EU' | 'JP' | 'CN' = 'KR';
    let countryName = '한국';
    
    const icon = toss.view.resourceUrl || '';
    if (icon.includes('us')) {
        country = 'US'; countryName = '미국';
    } else if (icon.includes('eu')) {
        country = 'EU'; countryName = '유럽';
    } else if (icon.includes('jp')) {
        country = 'JP'; countryName = '일본';
    } else if (icon.includes('cn')) {
        country = 'CN'; countryName = '중국';
    } else if (group.startsWith('USD_')) {
        country = 'US'; countryName = '미국';
    }

    let category: EconomicEvent['category'] = 'other';
    let categoryName = '일반';

    if (group === 'ECONOMIC') {
        if (title.includes('고용') || title.includes('NFP')) {
            category = 'employment'; categoryName = '고용';
        } else if (title.includes('물가') || title.includes('CPI') || title.includes('PPI')) {
            category = 'inflation'; categoryName = '물가';
        } else if (title.includes('금리') || title.includes('FOMC') || title.includes('통화')) {
            category = 'interest_rate'; categoryName = '금리';
        } else if (title.includes('GDP')) {
            category = 'gdp'; categoryName = '성장률';
        } else if (title.includes('수출') || title.includes('무역')) {
            category = 'trade'; categoryName = '무역';
        } else if (title.includes('제조업')) {
            category = 'manufacturing'; categoryName = '제조업';
        }
    } else if (group.includes('EARNINGS')) {
        category = 'earnings';
        categoryName = '실적발표';
    } else if (group === 'HOLIDAY') {
        category = 'other';
        categoryName = '휴장일';
    }

    let importance: 'high' | 'medium' | 'low' = 'low';
    if (group === 'ECONOMIC' || group.includes('EARNINGS')) {
        importance = 'medium';
        if (title.includes('CPI') || title.includes('금리') || title.includes('고용') || title.includes('FOMC')) {
            importance = 'high';
        }
    }

    const indicator = toss.view.economicIndicatorValue;
    const unit = indicator?.unitPrefix || '';
    
    // 예측치(Forecast) 보강 로직
    let forecastValue = indicator?.forecast;
    if ((forecastValue === undefined || forecastValue === null) && indicator?.ric) {
        const detail = detailsMap[indicator.ric];
        if (detail && detail.historicalData) {
            // 해당 날짜의 예측치 찾기
            const historical = detail.historicalData.find((h: any) => h.announceDate === date);
            if (historical && historical.forecastValue !== undefined && historical.forecastValue !== null) {
                forecastValue = historical.forecastValue;
            }
        }
    }

    const formatVal = (v?: number) => (v !== undefined && v !== null) ? `${v}${unit}` : undefined;

    const ev: EconomicEvent = {
        id: toss.id.uniqueName || `toss-${group}-${date}-${title}`,
        title: group.includes('EARNINGS') && toss.stockEarnings ? `${toss.stockEarnings.companyName} 실적발표` : title,
        date: date,
        time: indicator?.time?.substring(0, 5),
        country,
        countryName,
        importance,
        category,
        categoryName,
        previous: formatVal(indicator?.historical),
        forecast: formatVal(forecastValue),
        actual: formatVal(indicator?.actual),
        description: subtitle
    };

    if (group.includes('EARNINGS') && toss.stockEarnings) {
        if (toss.stockEarnings.salesDisplay) {
            ev.actual = toss.stockEarnings.salesDisplay;
        }
    }

    return ev;
}

/**
 * 이번 달과 다음 달의 토스 캘린더 데이터를 가져옵니다.
 */
export async function fetchTossCalendarData(): Promise<EconomicEvent[]> {
    const now = new Date();
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextYM = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

    console.log(`[Toss Scraper] Fetching data for ${currentYM} and ${nextYM}`);

    const [currentEvents, nextEvents] = await Promise.all([
        fetchTossMonthlyData(currentYM),
        fetchTossMonthlyData(nextYM)
    ]);

    const allTossEvents = [...currentEvents, ...nextEvents];
    
    // 수집된 이벤트 중 경제 지표(ECONOMIC)의 RIC 리스트 추출
    const rics = allTossEvents
        .filter(e => e.id.group === 'ECONOMIC' && e.view.economicIndicatorValue?.ric)
        .map(e => e.view.economicIndicatorValue!.ric!);
    
    // 중복 제거
    const uniqueRics = Array.from(new Set(rics));
    
    // 상세 정보(예측치) 일괄 수집
    console.log(`[Toss Scraper] Fetching details for ${uniqueRics.length} RICs to get forecasts`);
    const detailsMap = await fetchTossIndicatorsDetail(uniqueRics);

    return allTossEvents.map(ev => mapTossEvent(ev, detailsMap));
}
