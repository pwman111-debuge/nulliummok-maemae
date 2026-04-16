/**
 * KRX Intelligence - Fear & Greed 지수 산출 모듈
 * 
 * 현재 수집 중인 시장 데이터를 기반으로 자체 공포/탐욕 지수를 계산합니다.
 * 
 * 산출 기준 (각 25점, 총 100점):
 * 1. 시장 모멘텀 (KOSPI 등락률)
 * 2. 시장 변동성 (KOSDAQ 등락률 기반)
 * 3. 외국인 수급 (외국인 순매수/순매도)
 * 4. 환율 안정성 (USD/KRW 변동)
 */

import { MarketData } from './market-api';

export interface FearGreedResult {
    score: number;          // 0~100
    label: string;          // '극도의 공포' | '공포' | '중립' | '탐욕' | '극도의 탐욕'
    labelEn: string;        // 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed'
    emoji: string;
    color: string;          // CSS color class
    breakdown: {
        momentum: number;
        volatility: number;
        foreignFlow: number;
        currencyStability: number;
    };
    description: string;
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}

/**
 * 시장 데이터로부터 Fear & Greed 지수를 산출합니다.
 */
export function calculateFearGreed(data: MarketData): FearGreedResult {
    // ── 1. 시장 모멘텀 (KOSPI 등락률 기반, 25점 만점)
    const kospi = data.indices.find(i => i.name === 'KOSPI');
    const kospiPct = kospi ? parseFloat(kospi.percent.replace(/[^0-9.-]/g, '')) : 0;
    // -3% = 0점, 0% = 12.5점, +3% = 25점
    const momentum = clamp((kospiPct + 3) / 6 * 25, 0, 25);

    // ── 2. 시장 변동성 (KOSDAQ 등락률의 절댓값 기반, 25점 만점)
    // 변동성이 클수록 공포 → 점수가 낮음
    const kosdaq = data.indices.find(i => i.name === 'KOSDAQ');
    const kosdaqPct = kosdaq ? Math.abs(parseFloat(kosdaq.percent.replace(/[^0-9.-]/g, ''))) : 0;
    // 변동성 0% = 25점(안정), 5% = 0점(극변동)
    const volatility = clamp((5 - kosdaqPct) / 5 * 25, 0, 25);

    // ── 3. 외국인 수급 (25점 만점)
    const foreign = data.supply.find(s => s.name === '외국인');
    let foreignVal = 0;
    if (foreign) {
        foreignVal = parseInt(foreign.value.replace(/[^0-9-]/g, ''), 10) || 0;
    }
    // -30000억 = 0점, 0 = 12.5점, +30000억 = 25점
    const foreignFlow = clamp((foreignVal + 30000) / 60000 * 25, 0, 25);

    // ── 4. 환율 안정성 (25점 만점)
    // 환율 하락 → 긍정(자금유입), 환율 상승 → 부정(자본유출)
    const usdkrw = data.indices.find(i => i.name === 'USD/KRW');
    const fxPct = usdkrw ? parseFloat(usdkrw.percent.replace(/[^0-9.-]/g, '')) : 0;
    // +2% = 0점, 0% = 12.5점, -2% = 25점
    const currencyStability = clamp((2 - fxPct) / 4 * 25, 0, 25);

    const score = Math.round(momentum + volatility + foreignFlow + currencyStability);

    // 라벨 결정
    let label: string, labelEn: string, emoji: string, color: string, description: string;
    if (score <= 20) {
        label = '극도의 공포'; labelEn = 'Extreme Fear'; emoji = '😱'; color = 'text-red-600';
        description = '시장이 극심한 공포에 빠져 있습니다. 역발상 투자 기회일 수 있습니다.';
    } else if (score <= 40) {
        label = '공포'; labelEn = 'Fear'; emoji = '😟'; color = 'text-orange-500';
        description = '투자 심리가 위축되어 있습니다. 우량주 중심의 분할 매수를 고려해보세요.';
    } else if (score <= 60) {
        label = '중립'; labelEn = 'Neutral'; emoji = '😐'; color = 'text-yellow-500';
        description = '시장이 균형 상태입니다. 개별 종목의 펀더멘털에 집중하세요.';
    } else if (score <= 80) {
        label = '탐욕'; labelEn = 'Greed'; emoji = '🤑'; color = 'text-green-500';
        description = '강세장 분위기가 이어지며 투자 심리가 고조되고 있습니다.';
    } else {
        label = '극도의 탐욕'; labelEn = 'Extreme Greed'; emoji = '🔥'; color = 'text-emerald-600';
        description = '시장이 과열 상태입니다. 리스크 관리에 주의하세요.';
    }

    return {
        score,
        label, labelEn, emoji, color, description,
        breakdown: {
            momentum: Math.round(momentum),
            volatility: Math.round(volatility),
            foreignFlow: Math.round(foreignFlow),
            currencyStability: Math.round(currencyStability),
        },
    };
}
