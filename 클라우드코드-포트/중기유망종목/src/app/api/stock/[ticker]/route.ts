import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Cloudflare Workers Edge runtime
export const revalidate = 86400; // Cache for 24 hours (86400 seconds)

export async function GET(
    request: Request,
    { params }: { params: Promise<{ ticker: string }> }
) {
    const { ticker } = await params;
    
    // URL 매개변수로 시장 정보 받아오기 (옵션)
    const url = new URL(request.url);
    const market = url.searchParams.get('market') || 'KOSPI';
    const period = url.searchParams.get('period') || '3mo';
    
    // Yahoo Finance 방식에 맞춰 Ticker 변환 (KOSPI는 .KS, KOSDAQ은 .KQ)
    let yfTicker = ticker;
    if (market.toUpperCase() === 'KOSPI') {
        yfTicker = `${ticker}.KS`;
    } else if (market.toUpperCase() === 'KOSDAQ') {
        yfTicker = `${ticker}.KQ`;
    }

    try {
        // Yahoo Finance v8 API 호출
        // period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
        const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yfTicker}?range=${period}&interval=1d`;
        
        const res = await fetch(yfUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            },
            next: { revalidate: 86400 } // Next.js Fetch API 캐싱 (24시간)
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Failed to fetch data from Yahoo Finance: ${res.status}` },
                { status: res.status }
            );
        }

        const data = await res.json();
        const result = data.chart.result?.[0];
        
        if (!result) {
            return NextResponse.json({ error: 'No data found' }, { status: 404 });
        }

        const timestamps = result.timestamp || [];
        const closePrices = result.indicators?.quote?.[0]?.close || [];
        
        // Lightweight Charts 포맷에 맞게 데이터 변환 [{ time: '2023-12-22', value: 32.51 }]
        const chartData = timestamps
            .map((ts: number, index: number) => {
                const date = new Date(ts * 1000);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                
                return {
                    time: `${year}-${month}-${day}`, // YYYY-MM-DD 형식
                    value: closePrices[index],
                };
            })
            // 유효하지 않은 value 필터링 (null 등)
            .filter((item: any) => item.value !== null && item.value !== undefined);

        return NextResponse.json({ 
            ticker, 
            market, 
            meta: result.meta,
            data: chartData 
        }, {
            headers: {
                // Cloudflare CDN 캐시 정책 (최대 24시간 동안 사용자/CDN단에 캐싱)
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
