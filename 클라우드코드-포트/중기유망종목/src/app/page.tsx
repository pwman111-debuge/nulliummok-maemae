export const dynamic = 'force-dynamic';
export const runtime = 'edge';
export const revalidate = 0;

import { TrendingUp, TrendingDown, Users, Activity, ArrowRight, Calendar, Zap, Globe, BarChart3 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getLatestMarketData } from "@/lib/api/market-api";
import { getNextHighImpactEvent, getFlag } from "@/lib/api/economic-calendar";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { StockChart } from "@/components/common/StockChart";
import Image from "next/image";
import { allMarketAnalyses, allStockReports, allStockPicks } from 'contentlayer2/generated';

export default async function Home() {
  const marketData = await getLatestMarketData();
  const nextEvent = await getNextHighImpactEvent();

  // 최근 시황 분석 (최대 3개)
  const recentAnalyses = [...allMarketAnalyses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // 최근 종목 리포트 (최대 3개)
  const recentReports = [...allStockReports]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);


  return (
    <div className="space-y-10">
      {/* Premium Hero Section with SEO Optimization */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm">
        {/* Decorative Background Image */}
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-30 md:opacity-100 pointer-events-none">
          <div className="absolute inset-0 z-10 bg-gradient-to-l from-transparent via-card/50 to-card" />
          <Image
            src="/images/hero-wisdom.png"
            alt="KRX Intelligence - 전술적 주식 분석"
            fill
            className="object-contain object-right"
            priority
          />
        </div>

        <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4 border border-primary/20">
              <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-primary"></span>
              실시간 한국 증시 인텔리전스
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
              제네시스 주식 리포트: <br />
              <span className="text-primary">한국 주식 분석</span> & 시황
            </h1>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
              시장 흐름을 읽는 명확한 시선. <br className="hidden md:block" />
              코스피·코스닥 핵심 지표와 종목 리포트를 통해 <br className="hidden md:block" />
              당신의 투자 인사이트를 극대화하세요.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/analysis" className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 flex items-center shadow-lg">
                분석 리포트 읽기 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span>실시간 데이터</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>기술적 분석</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-end gap-3 self-end md:self-auto pt-4 md:pt-0">
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Last Updated</p>
              <p className="text-sm font-black tabular-nums">{marketData.lastUpdated}</p>
            </div>
            <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-xl border border-border">
              <span className="text-[11px] text-muted-foreground px-1 font-medium">네이버 자동 수집</span>
              <RefreshButton />
            </div>
          </div>
        </div>
      </section>

      {/* Market Indices - Featured Charts (Restored from previous version) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StockChart code="KOSPI" title="KOSPI" className="w-full" />
        <StockChart code="KOSDAQ" title="KOSDAQ" className="w-full" />
      </div>

      {/* Market Indices Grid - Other Indicators */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {marketData.indices
          .filter(idx => idx.name !== 'KOSPI' && idx.name !== 'KOSDAQ')
          .map((idx) => (
            <div key={idx.name} className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-tight">{idx.name}</span>
                {idx.status === "up" ? (
                  <TrendingUp className="h-4 w-4 text-kr-up" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-kr-down" />
                )}
              </div>
              <div className="flex items-end justify-between">
                <span className={cn("text-2xl font-bold tabular-nums",
                  idx.status === "up" ? "text-kr-up font-black" :
                    idx.status === "down" ? "text-kr-down font-black" : ""
                )}>
                  {idx.value}
                </span>
                <div className={cn("flex flex-col items-end text-[11px] font-bold",
                  idx.status === "up" ? "text-kr-up" :
                    idx.status === "down" ? "text-kr-down" :
                      "text-muted-foreground"
                )}>
                  <span>{idx.change}</span>
                  <span>{idx.percent}</span>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Investor Supply Section */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              수급 현황 (당일)
            </h2>
          </div>
          <div className="space-y-4">
            {marketData.supply.map((inv) => (
              <div key={inv.name} className="flex items-center justify-between">
                <span className="text-sm text-foreground font-medium">{inv.name}</span>
                <div className="flex items-center">
                  <span className={cn("text-sm font-bold", inv.status === "up" ? "text-kr-up" : "text-kr-down")}>
                    {inv.value}
                  </span>
                  <div className={cn("ml-2 h-2 w-16 rounded-full bg-muted")}>
                    <div className={cn("h-full rounded-full transition-all", inv.status === "up" ? "bg-kr-up" : "bg-kr-down")} style={{ width: inv.value.includes('+') ? '70%' : '40%' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[11px] text-muted-foreground">* 코스피 시장 기준, 단위: 억원</p>
        </div>

        {/* ① Latest Market Analysis Section — 실제 MDX 연동 */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              최근 시황 분석
            </h2>
            <Link href="/market" className="text-xs font-medium text-primary hover:underline flex items-center">
              전체보기 <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentAnalyses.length > 0 ? (
              recentAnalyses.map((post, idx) => (
                <div key={post._id ?? idx} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link href={post.url} className="font-medium hover:text-primary transition-colors text-sm">
                        {post.title}
                      </Link>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(post.date).toISOString().split('T')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                시황 분석 글이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* ② Latest Stock Reports Section — 새로 추가 */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              최근 종목 리포트
            </h2>
            <Link href="/analysis" className="text-xs font-medium text-primary hover:underline flex items-center">
              전체보기 <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentReports.length > 0 ? (
              recentReports.map((report, idx) => (
                <div key={report._id ?? idx} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link href={report.url} className="font-medium hover:text-primary transition-colors text-sm">
                        [{report.ticker}] {report.title}
                      </Link>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(report.date).toISOString().split('T')[0]}
                        </span>
                        <span className="inline-flex items-center rounded bg-slate-100 px-1 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                          {report.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                분석 리포트가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Overview Cards Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* ② VIX 공포 지수 — 네이버 데이터 기반 */}
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <Zap className="mr-1.5 h-4 w-4" />
              VIX (변동성 지수)
            </h3>
            {marketData.vix && (
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm",
                marketData.vix.status === 'up' ? "bg-red-50 text-kr-up border border-red-100" : "bg-blue-50 text-kr-down border border-blue-100"
              )}>
                {marketData.vix.change} ({marketData.vix.percent})
              </span>
            )}
          </div>

          {marketData.vix?.value ? (() => {
            const val = parseFloat(marketData.vix.value.toString().replace(/,/g, ''));
            let status = { label: "알 수 없음", color: "text-slate-500", border: "border-slate-400", bg: "bg-slate-400", desc: "데이터 수집 중입니다." };

            if (val < 15) status = { label: "극도의 평온", color: "text-blue-600", border: "border-blue-400", bg: "bg-blue-400", desc: "시장이 매우 안정적입니다. 낙관론이 지배적입니다." };
            else if (val < 20) status = { label: "안정적", color: "text-green-600", border: "border-green-400", bg: "bg-green-400", desc: "정상적인 범위 내의 변동성입니다." };
            else if (val < 30) status = { label: "공포/주의", color: "text-yellow-600", border: "border-yellow-400", bg: "bg-yellow-400", desc: "시장의 불안감이 커지고 있습니다. 주의가 필요합니다." };
            else status = { label: "패닉", color: "text-red-600", border: "border-red-400", bg: "bg-red-400", desc: "시장 공포가 극에 달했습니다. 변동성에 대비하세요." };

            return (
              <>
                <div className="flex items-center space-x-4">
                  <div className={cn("h-14 w-14 rounded-full border-4 flex items-center justify-center font-black text-lg", status.border, status.color)}>
                    {val.toFixed(2)}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-bold flex items-center gap-1.5", status.color)}>
                      {status.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
                      {status.desc}
                    </p>
                  </div>
                </div>

                {/* Gauge Bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-400 w-[30%]" title="평온" />
                    <div className="h-full bg-green-400 w-[10%]" title="안정" />
                    <div className="h-full bg-yellow-400 w-[20%]" title="주의" />
                    <div className="h-full bg-red-400 w-[40%]" title="패닉" />
                    {/* Indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-black shadow-lg z-10"
                      style={{ left: `${Math.min((val / 50) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-muted-foreground px-0.5">
                    <span>0</span>
                    <span>15</span>
                    <span>20</span>
                    <span>30</span>
                    <span>50+</span>
                  </div>
                </div>
              </>
            );
          })() : (
            <div className="py-8 text-center text-sm text-muted-foreground italic">
              VIX 데이터를 불러올 수 없습니다.
            </div>
          )}
        </div>

        {/* ③ 경제 캘린더 — 자동 이벤트 표시 */}
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
              <Calendar className="mr-1.5 h-4 w-4" />
              경제 캘린더
            </h3>
            {nextEvent ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg" title={nextEvent.countryName}>
                    {getFlag(nextEvent.country)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                    중요
                  </span>
                </div>
                <p className="text-sm font-bold leading-tight">{nextEvent.title}</p>
                <p className="text-xs text-muted-foreground">
                  {nextEvent.date} {nextEvent.time ? `${nextEvent.time} KST` : ''}
                </p>
                {nextEvent.description && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                    {nextEvent.description}
                  </p>
                )}
                {(nextEvent.actual || nextEvent.forecast || nextEvent.previous) && (
                  <div className="flex gap-4 mt-2 text-[11px]">
                    {nextEvent.actual && (
                      <span className="text-muted-foreground">발표: <strong className="text-green-600">{nextEvent.actual}</strong></span>
                    )}
                    {nextEvent.forecast && (
                      <span className="text-muted-foreground">예측: <strong className="text-primary">{nextEvent.forecast}</strong></span>
                    )}
                    {nextEvent.previous && (
                      <span className="text-muted-foreground">이전: <strong>{nextEvent.previous}</strong></span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">예정된 주요 이벤트가 없습니다.</p>
            )}
          </div>
          <Link href="/calendar" className="mt-4 text-xs font-semibold text-primary hover:underline flex items-center">
            전체 일정 보기 <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        {/* ④ 장단기 금리차 (10Y-2Y) — 네이버 데이터 기반 */}
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
            <BarChart3 className="mr-1.5 h-4 w-4" />
            장단기 금리차 (10Y-2Y)
          </h3>
          <div className="space-y-4">
            {marketData.yieldSpreads?.map((spread) => {
              const val = parseFloat(spread.value);
              const isInverted = val < 0;
              return (
                <div key={spread.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{spread.name}</span>
                    <span className={cn(
                      "text-xs font-bold px-1.5 py-0.5 rounded",
                      isInverted ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {isInverted ? "장단기 역전" : "정상적 우상향"}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className={cn("text-xl font-black tabular-nums", isInverted ? "text-red-600" : "text-slate-900")}>
                      {spread.value} <span className="text-[10px] font-normal text-muted-foreground">%p</span>
                    </span>
                    <span className={cn("text-[11px] font-bold", spread.change.includes('+') ? "text-kr-up" : spread.change.includes('-') ? "text-kr-down" : "text-muted-foreground")}>
                      {spread.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-[10px] text-muted-foreground leading-tight">
            * <strong>역전(마이너스)</strong> 발생 시 경기 침체의 강력한 신호로 해석됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
