export const dynamic = 'force-static';
export const revalidate = 3600; // 1시간마다 재생성 (옵션)

import { Calendar, Clock, Globe, AlertTriangle, ChevronRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEconomicEvents, getFlag, type EconomicEvent } from '@/lib/api/economic-calendar';

const IMPORTANCE_STYLE = {
    high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: '🔴 높음' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: '🟡 보통' },
    low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: '🟢 낮음' },
};

const CATEGORY_ICONS: Record<string, string> = {
    employment: '👷', inflation: '📊', interest_rate: '🏦',
    gdp: '📈', trade: '🚢', manufacturing: '🏭',
    housing: '🏠', earnings: '💰', other: '📋',
};

export default async function CalendarPage() {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const allEvents = await getEconomicEvents();

    // 이벤트를 날짜별로 그룹핑
    const groupedByDate: Record<string, EconomicEvent[]> = {};
    allEvents.forEach(ev => {
        if (!groupedByDate[ev.date]) groupedByDate[ev.date] = [];
        groupedByDate[ev.date].push(ev);
    });

    const sortedDates = Object.keys(groupedByDate).sort();

    return (
        <div className="space-y-8 pb-10">
            <section>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-primary" />
                    경제 캘린더
                </h1>
                <p className="text-muted-foreground mt-2">
                    글로벌 주요 경제 이벤트 일정을 확인하고 투자 전략에 반영하세요.
                </p>
            </section>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase">전체 이벤트</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{allEvents.length}건</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
                    <p className="text-xs font-medium text-red-600 uppercase">🔴 주요 이벤트</p>
                    <p className="mt-1 text-2xl font-bold text-red-700">
                        {allEvents.filter(e => e.importance === 'high').length}건
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase">다음 이벤트까지</p>
                    <p className="mt-1 text-2xl font-bold text-primary">
                        {(() => {
                            const next = allEvents.find(e => e.date >= today);
                            if (!next) return '-';
                            const diff = Math.ceil((new Date(next.date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
                            return diff === 0 ? '오늘' : `D-${diff}`;
                        })()}
                    </p>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
                {sortedDates.map(date => {
                    const events = groupedByDate[date];
                    const isPast = date < today;
                    const isToday = date === today;
                    const dateObj = new Date(date + 'T00:00:00');
                    const dayName = dateObj.toLocaleDateString('ko-KR', { weekday: 'short' });

                    return (
                        <div key={date} className={cn("relative", isPast && "opacity-60")}>
                            {/* Date header */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold",
                                    isToday ? "bg-primary text-white" : "bg-muted text-foreground"
                                )}>
                                    <Calendar className="h-4 w-4" />
                                    {date} ({dayName})
                                    {isToday && <span className="text-[10px] font-normal ml-1">TODAY</span>}
                                </div>
                                {isPast && (
                                    <span className="text-[10px] text-muted-foreground">지나간 일정</span>
                                )}
                            </div>

                            {/* Events */}
                            <div className="space-y-3 ml-2 border-l-2 border-border pl-4">
                                {events.map(ev => {
                                    const imp = IMPORTANCE_STYLE[ev.importance];
                                    return (
                                        <div key={ev.id} className={cn(
                                            "rounded-xl border p-4 shadow-sm transition-all hover:shadow-md",
                                            imp.border, "bg-white"
                                        )}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-lg" title={ev.countryName}>
                                                            {getFlag(ev.country)}
                                                        </span>
                                                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold border", imp.bg, imp.text, imp.border)}>
                                                            {imp.label}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {CATEGORY_ICONS[ev.category] ?? '📋'} {ev.categoryName}
                                                        </span>
                                                        {ev.time && (
                                                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                                <Clock className="h-3 w-3" /> {ev.time} KST
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="text-sm font-bold">{ev.title}</h3>

                                                    {ev.description && (
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            {ev.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Data columns */}
                                                {(ev.previous || ev.forecast || ev.actual) && (
                                                    <div className="flex gap-4 text-center shrink-0">
                                                        {ev.actual && (
                                                            <div>
                                                                <p className="text-[9px] text-muted-foreground uppercase">발표</p>
                                                                <p className="text-xs font-bold text-green-600">{ev.actual}</p>
                                                            </div>
                                                        )}
                                                        {ev.forecast && (
                                                            <div>
                                                                <p className="text-[9px] text-muted-foreground uppercase">예측</p>
                                                                <p className="text-xs font-bold text-primary">{ev.forecast}</p>
                                                            </div>
                                                        )}
                                                        {ev.previous && (
                                                            <div>
                                                                <p className="text-[9px] text-muted-foreground uppercase">이전</p>
                                                                <p className="text-xs font-bold">{ev.previous}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {sortedDates.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border bg-muted/20">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground">예정된 경제 이벤트가 없습니다.</p>
                </div>
            )}
        </div>
    );
}
