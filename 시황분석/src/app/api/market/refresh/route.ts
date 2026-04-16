export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { fetchNaverMarketData } from '@/lib/api/naver-scraper';
import { updateMarketCache, getCacheTimestamp } from '@/lib/api/market-api';

/**
 * GET /api/market/refresh
 * 네이버 증권에서 최신 시장 데이터를 강제로 수집하고 캐시를 업데이트합니다.
 */
export async function GET() {
    const startTime = Date.now();
    try {
        console.log('[/api/market/refresh] 수동 새로고침 요청');
        const data = await fetchNaverMarketData();
        updateMarketCache(data);

        const elapsed = Date.now() - startTime;
        console.log(`[/api/market/refresh] 완료 (${elapsed}ms):`, data.lastUpdated);

        return NextResponse.json({
            success: true,
            elapsed: `${elapsed}ms`,
            data,
        });
    } catch (error) {
        const elapsed = Date.now() - startTime;
        console.error('[/api/market/refresh] 수집 실패:', error);

        return NextResponse.json(
            {
                success: false,
                elapsed: `${elapsed}ms`,
                error: error instanceof Error ? error.message : '알 수 없는 오류',
                lastCached: new Date(getCacheTimestamp()).toISOString(),
            },
            { status: 500 }
        );
    }
}
