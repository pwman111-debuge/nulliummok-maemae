
"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as LightweightCharts from 'lightweight-charts';
import { cn } from '@/lib/utils';

interface StockChartProps {
    code: string;
    title: string;
    className?: string;
}

interface PriceInfo {
    localDate: string;
    closePrice: number;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
}

export function StockChart({ code, title, className }: StockChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const lineSeriesRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [priceChange, setPriceChange] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/chart/index?code=${code}&periodType=month&range=3`);
                const data = await res.json();

                if (data.priceInfos) {
                    const sortedData = data.priceInfos.map((item: any) => ({
                        time: `${item.localDate.slice(0, 4)}-${item.localDate.slice(4, 6)}-${item.localDate.slice(6, 8)}`,
                        value: item.closePrice,
                    }));

                    if (lineSeriesRef.current) {
                        lineSeriesRef.current.setData(sortedData);

                        const last = sortedData[sortedData.length - 1];
                        const prev = sortedData[sortedData.length - 2];
                        setCurrentPrice(last.value);
                        if (prev) {
                            const change = last.value - prev.value;
                            const percent = (change / prev.value) * 100;
                            setPriceChange(`${change > 0 ? '+' : ''}${change.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${change > 0 ? '+' : ''}${percent.toFixed(2)}%)`);

                            // 동적으로 라인 색상 변경
                            if (lineSeriesRef.current) {
                                const up = change >= 0;
                                lineSeriesRef.current.applyOptions({
                                    lineColor: up ? '#e11d48' : '#2563eb',
                                    topColor: up ? 'rgba(225, 29, 72, 0.28)' : 'rgba(37, 99, 235, 0.28)',
                                    bottomColor: up ? 'rgba(225, 29, 72, 0.05)' : 'rgba(37, 99, 235, 0.05)',
                                });
                            }
                        }

                        chartRef.current.timeScale().fitContent();
                    }
                }
                setIsLoading(false);
            } catch (err) {
                console.error('Fetch error:', err);
                setIsLoading(false);
            }
        };

        if (chartContainerRef.current) {
            const chart = LightweightCharts.createChart(chartContainerRef.current, {
                layout: {
                    background: { type: LightweightCharts.ColorType.Solid, color: 'transparent' },
                    textColor: '#64748b',
                    fontSize: 12,
                },
                grid: {
                    vertLines: { color: 'rgba(235, 237, 241, 0.4)' },
                    horzLines: { color: 'rgba(235, 237, 241, 0.4)' },
                },
                width: chartContainerRef.current.clientWidth,
                height: 350,
                timeScale: {
                    borderVisible: false,
                },
                rightPriceScale: {
                    borderVisible: false,
                },
                handleScroll: false,
                handleScale: false, // Disable zoom for dashboard
                localization: {
                    locale: 'ko-KR',
                    dateFormat: 'yyyy-MM-dd',
                },
            });

            // Customize time scale for cleaner labels
            chart.timeScale().applyOptions({
                borderVisible: false,
                timeVisible: false,
                secondsVisible: false,
            });

            if (chart && typeof chart.addSeries === 'function') {
                const lineSeries = chart.addSeries(LightweightCharts.AreaSeries, {
                    lineColor: '#2563eb', // 초기 기본값 (파랑)
                    topColor: 'rgba(37, 99, 235, 0.28)',
                    bottomColor: 'rgba(37, 99, 235, 0.05)',
                    lineWidth: 2,
                    priceFormat: {
                        type: 'price',
                        precision: 2,
                        minMove: 0.01,
                    },
                });

                chartRef.current = chart;
                lineSeriesRef.current = lineSeries;

                fetchData();

                // 1분마다 실시간 데이터 폴링 (장중 실시간 업데이트)
                const interval = setInterval(fetchData, 60000);

                const handleResize = () => {
                    if (chartContainerRef.current) {
                        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
                    }
                };

                window.addEventListener('resize', handleResize);

                return () => {
                    clearInterval(interval);
                    window.removeEventListener('resize', handleResize);
                    chart.remove();
                };
            }
        }
    }, [code]);

    return (
        <div className={cn("bg-white rounded-2xl border border-border p-6 shadow-sm", className)}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">{title} 지수 (3개월)</h3>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-foreground">
                            {currentPrice ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '...'}
                        </span>
                        <span className={cn(
                            "text-sm font-black tabular-nums",
                            priceChange?.startsWith('+') ? "text-kr-up" : "text-kr-down"
                        )}>
                            {priceChange || '...'}
                        </span>
                    </div>
                </div>
                <div className="flex space-x-1">
                    {['1D', '1W', '1M', '3M', '1Y'].map((p) => (
                        <button key={p} className={cn(
                            "px-3 py-1 text-xs rounded-full transition-colors",
                            p === '3M' ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-accent"
                        )}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 transition-opacity">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                )}
                <div ref={chartContainerRef} className="w-full" />
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <p>제공: Naver 페이 증권 (실시간 지수)</p>
                <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-success mr-2 animate-pulse"></div>
                    실시간 연결됨
                </div>
            </div>
        </div>
    );
}
