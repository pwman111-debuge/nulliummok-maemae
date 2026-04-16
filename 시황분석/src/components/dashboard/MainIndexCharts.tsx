"use client";

import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
    symbol: string;
    title: string;
    className?: string;
}

export function PortfolioChart({ symbol, title, className }: TradingViewChartProps) {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "symbol": symbol,
            "width": "100%",
            "height": 220,
            "locale": "ko",
            "dateRange": "3M",
            "colorTheme": "light",
            "isTransparent": false,
            "autosize": true,
            "largeChartUrl": "",
            "noTimeScale": false,
            "chartOnly": false,
            "text-color": "#4b5563",
            "line-color": "#2563eb", /* 하락 시 푸른색을 위한 기본색 (위젯 내부 로직과 조율 필요) */
            "topColor": "rgba(37, 99, 235, 0.1)",
            "bottomColor": "rgba(37, 99, 235, 0)",
            "trendLineColor": "#2563eb"
        });

        container.current.appendChild(script);

        return () => {
            if (container.current) {
                container.current.innerHTML = '';
            }
        };
    }, [symbol]);

    return (
        <div className={className} ref={container}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
}

export function MainIndexCharts() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm overflow-hidden">
                <h3 className="text-sm font-bold text-muted-foreground mb-4 px-2">KOSPI 지수 (3개월)</h3>
                <PortfolioChart symbol="TVC:KOSPI" title="KOSPI" />
                <p className="mt-2 text-[10px] text-right text-muted-foreground px-2">제공: TradingView / KRX Intelligence</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm overflow-hidden">
                <h3 className="text-sm font-bold text-muted-foreground mb-4 px-2">KOSDAQ 지수 (3개월)</h3>
                <PortfolioChart symbol="TVC:KOSDAQ" title="KOSDAQ" />
                <p className="mt-2 text-[10px] text-right text-muted-foreground px-2">제공: TradingView / KRX Intelligence</p>
            </div>
        </div>
    );
}
