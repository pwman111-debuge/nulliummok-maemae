"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries } from "lightweight-charts";
import { Loader2 } from "lucide-react";

interface StockChartProps {
    ticker: string;
    market?: 'KOSPI' | 'KOSDAQ' | 'NYSE' | 'NASDAQ';
    title?: string;
    period?: string;
    className?: string; // Add className prop
}

export function CustomStockChart({ 
    ticker, 
    market = 'KOSPI', 
    title, 
    period = '3mo',
    className
}: StockChartProps) {
    const isUSMarket = ['NYSE', 'NASDAQ'].includes(market);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [priceDiff, setPriceDiff] = useState<number | null>(null);
    const [priceDiffPercent, setPriceDiffPercent] = useState<number | null>(null);
    
    // 차트 레이아웃 크기 조절 참조
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

    useEffect(() => {
        let isMounted = true;
        
        const fetchAndRenderChart = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // 1. API 데이터 페치
                const response = await fetch(`/api/stock/${ticker}?market=${market}&period=${period}`);
                if (!response.ok) {
                    throw new Error(`데이터를 불러올 수 없습니다. (${response.status})`);
                }
                
                const json = await response.json();
                const chartData = json.data;

                if (!chartData || chartData.length === 0) {
                    throw new Error("표시할 차트 데이터가 없습니다.");
                }

                if (!isMounted) return;

                // 최신가 및 변동률 계산
                const latestPrice = chartData[chartData.length - 1].value;
                const prevPrice = chartData[chartData.length - 2]?.value || latestPrice;
                const diff = latestPrice - prevPrice;
                const percent = (diff / prevPrice) * 100;
                
                setCurrentPrice(latestPrice);
                setPriceDiff(diff);
                setPriceDiffPercent(percent);

                // 2. 차트 렌더링 준비
                if (!chartContainerRef.current) return;
                
                // 기존 차트 인스턴스 초기화
                if (chartRef.current) {
                    chartRef.current.remove();
                    chartRef.current = null;
                }

                // 트레이딩뷰 옵션과 유사한 스타일 적용
                const chart = createChart(chartContainerRef.current, {
                    layout: {
                        background: { type: ColorType.Solid, color: 'transparent' },
                        textColor: '#64748b', // slate-500
                    },
                    grid: {
                        vertLines: { color: 'rgba(226, 232, 240, 0.5)' }, // slate-200
                        horzLines: { color: 'rgba(226, 232, 240, 0.5)' },
                    },
                    rightPriceScale: {
                        borderVisible: false,
                        scaleMargins: {
                            top: 0.1,
                            bottom: 0.1,
                        },
                    },
                    timeScale: {
                        borderVisible: false,
                        timeVisible: true,
                        tickMarkFormatter: (time: string) => {
                            const date = new Date(time);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                        },
                    },
                    autoSize: true, // 반응형
                });

                chartRef.current = chart;

                // 영역(Area) 시리즈 추가
                const isPositive = diff >= 0;
                const mainColor = isPositive ? '#ef4444' : '#3b82f6'; // 빨강(상승) 파랑(하락) (한국식)
                const topColor = isPositive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)';

                const areaSeries = chart.addSeries(AreaSeries, {
                    lineColor: mainColor,
                    topColor: topColor,
                    bottomColor: 'rgba(255, 255, 255, 0)',
                    lineWidth: 2,
                    priceFormat: {
                        type: 'price',
                        precision: isUSMarket ? 2 : 0, // US 시장은 소수점 2자리, 한국 시장은 0자리
                        minMove: isUSMarket ? 0.01 : 1,
                    },
                });

                areaSeries.setData(chartData);
                chart.timeScale().fitContent(); // 내용에 맞게 꽉 채움

                setLoading(false);
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || '차트 로드 중 오류가 발생했습니다.');
                    setLoading(false);
                }
            }
        };

        fetchAndRenderChart();

        return () => {
            isMounted = false;
            // 언마운트 시 차트 객체 제거 방지 메모리 누수
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [ticker, market, period, isUSMarket]);

    const isPositive = (priceDiff || 0) >= 0;

    return (
        <div className={`rounded-2xl border border-border bg-card p-4 shadow-sm my-6 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 px-2">
                <div>
                    <h3 className="text-sm font-bold text-muted-foreground mb-1">
                        {title || `${ticker} 차트`}
                    </h3>
                    <div className="flex items-center space-x-2">
                        {currentPrice !== null && (
                            <span className="text-2xl font-bold tracking-tight">
                                {isUSMarket ? `$${currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}` : `${currentPrice.toLocaleString()}원`}
                            </span>
                        )}
                        {priceDiffPercent !== null && (
                            <span className={`text-sm font-medium ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
                                {isPositive ? '+' : ''}{priceDiffPercent.toFixed(2)}%
                            </span>
                        )}
                    </div>
                </div>
                <div className="mt-2 sm:mt-0">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {market} | {ticker}
                    </span>
                </div>
            </div>

            {/* Chart Container */}
            <div className="relative w-full h-[300px] sm:h-[400px]">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-sm font-medium text-muted-foreground animate-pulse">
                            최신 실시간 가격 데이터를 불러오는 중...
                        </p>
                    </div>
                )}
                
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10 p-4 text-center">
                        <div className="rounded-full bg-red-100 p-3 mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-red-600 mb-1">데이터 로드 실패</p>
                        <p className="text-xs text-muted-foreground">{error}</p>
                    </div>
                )}

                <div 
                    ref={chartContainerRef} 
                    className="w-full h-full"
                    style={{ visibility: loading || error ? 'hidden' : 'visible' }}
                />
            </div>

            <div className="mt-4 flex items-center justify-between px-2">
                <p className="text-[10px] text-muted-foreground">
                    데이터 기준: 종가 (일봉)
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center space-x-1">
                    <span>데이터 제공:</span>
                    <span className="font-semibold">Yahoo Finance API</span>
                </p>
            </div>
        </div>
    );
}
