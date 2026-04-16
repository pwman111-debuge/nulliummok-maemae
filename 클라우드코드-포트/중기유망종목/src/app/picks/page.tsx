import { allStockPicks } from 'contentlayer2/generated';
import { compareDesc, format, parseISO } from 'date-fns';
import { Search, ArrowRight, Calendar, Layers, CheckCircle2, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const POSTS_PER_PAGE = 9;

export const dynamic = 'force-static';

export default function PicksPage() {
    const currentPage = 1;

    // 일일 통합 리포트(GENESIS) 형식 필터링 및 정렬
    const allReports = allStockPicks
        .filter(pick => pick.ticker === 'GENESIS')
        .sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));

    const totalPages = Math.ceil(allReports.length / POSTS_PER_PAGE);
    const dailyReports = allReports.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    return (
        <div className="space-y-12 pb-20">
            {/* Header Section with subtle gradient background */}
            <section className="relative py-12 px-6 rounded-3xl overflow-hidden bg-slate-900 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974717482-9800ff9c7841?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-emerald-600/20" />
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary p-2 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-bold tracking-widest text-primary-foreground/80 uppercase">Genesis AI Engine</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
                        유망 종목 발굴 <span className="text-primary italic">인사이트</span>
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed">
                        제네시스 AI가 매일 시장의 수급과 모멘텀을 분석하여 선정합니다. <br className="hidden md:block" />
                        단기 급등 가능성이 높은 핵심 종목들을 확인하세요.
                    </p>
                </div>
            </section>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dailyReports.map((report) => {
                    // summary에서 종목명 추출 (예: "금일의 발굴 종목: 삼성중공업, 유니온머티리얼, 한전기술" 또는 일반 문장)
                    let stockList = report.summary.includes(':') 
                        ? report.summary.split(':')[1].split(',').map(s => s.trim())
                        : report.summary.split(',').slice(0, 3).map(s => s.trim());
                    
                    // 만약 너무 길면 (종목명이 아닌 긴 문장이면) 태그나 제목에서 가져오기 시도
                    if (stockList[0]?.length > 20) {
                        stockList = report.tags?.filter(t => !['단기유망', 'KOSPI', 'KOSDAQ', '제네시스', 'GENESIS'].includes(t)).slice(0, 3) || [];
                    }
                    
                    if (stockList.length === 0) stockList = ['상세 리포트 참조'];

                    return (
                        <Link key={report._id} href={report.url} className="block group">
                            <article className="h-full relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                                {/* Decor Circle */}
                                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                
                                <div className="relative flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-2.5">
                                            <div className="bg-primary/10 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-500">
                                                <Layers className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="text-xs font-black text-primary tracking-widest uppercase">GENESIS REPORT</span>
                                            {report.term && (
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold shadow-sm animate-pulse ml-1 ${
                                                    report.term === 'short' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                                                    report.term === 'mid' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' :
                                                    'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}>
                                                    {report.term === 'short' ? 'PRO | 단기' : 
                                                     report.term === 'mid' ? '중기' : '장기'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-[xs] text-muted-foreground font-semibold bg-muted/50 px-3 py-1.5 rounded-full">
                                            <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                            {format(parseISO(report.date), 'yyyy.MM.dd')}
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-black tracking-tight mb-6 group-hover:text-primary transition-colors leading-tight">
                                        {format(parseISO(report.date), 'MM월 dd일')} <br />
                                        포착된 유망 섹터
                                    </h2>

                                    <div className="flex-grow space-y-4 mb-8">
                                        <div className="bg-muted/30 rounded-2xl p-5 border border-border/40 backdrop-blur-sm group-hover:bg-muted/50 transition-colors">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Focus Elements</p>
                                            <div className="space-y-3.5">
                                                {stockList.map((stock, i) => (
                                                    <div key={i} className="flex items-center justify-between group/item">
                                                        <span className="text-sm font-bold flex items-center gap-2.5 text-foreground/90">
                                                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                            </div>
                                                            {stock}
                                                        </span>
                                                        <div className="h-px flex-grow mx-3 bg-border/50 group-hover/item:bg-primary/20 transition-colors" />
                                                        <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md self-center">PICK</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-border/50">
                                        <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">상세 분석 리포트 보기</span>
                                        <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:rotate-[360deg] transition-all duration-700">
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    )
                })}
            </div>

            {/* Pagination Controls */}
            {allReports.length > POSTS_PER_PAGE && (
                <div className="flex items-center justify-center space-x-2 pt-8">
                    <Link
                        href="#"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-all pointer-events-none opacity-30"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={page === 1 ? '/picks' : `/picks/page/${page}`}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                                currentPage === page
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'border-border hover:bg-muted'
                            }`}
                        >
                            {page}
                        </Link>
                    ))}

                    <Link
                        href={currentPage < totalPages ? `/picks/page/${currentPage + 1}` : '#'}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-all ${
                            currentPage < totalPages ? 'hover:bg-primary hover:text-white hover:border-primary' : 'pointer-events-none opacity-30'
                        }`}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Link>
                </div>
            )}

            {allReports.length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 text-center rounded-[3rem] border-2 border-dashed border-border bg-muted/5">
                    <div className="relative mb-6">
                        <Search className="h-16 w-16 text-muted-foreground opacity-10" />
                        <div className="absolute inset-0 animate-pulse bg-primary/5 rounded-full scale-150 blur-xl" />
                    </div>
                    <h3 className="text-xl font-black">새로운 분석 로딩 중</h3>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm">
                        제네시스 알고리즘이 실시간 시장 데이터를 바탕으로 최고의 기회를 탐색하고 있습니다.
                    </p>
                </div>
            )}
        </div>
    );
}
