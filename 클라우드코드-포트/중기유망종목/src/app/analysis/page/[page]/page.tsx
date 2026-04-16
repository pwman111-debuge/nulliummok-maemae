import { allStockReports } from 'contentlayer2/generated';
import { format, parseISO } from 'date-fns';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const POSTS_PER_PAGE = 10;

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    const totalReports = allStockReports.length;
    const totalPages = Math.ceil(totalReports / POSTS_PER_PAGE);
    
    const pages = Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
        page: (i + 2).toString(),
    }));

    // 빌드 에러 방지를 위한 더미 경로 반환
    if (pages.length === 0) {
        return [{ page: '2' }];
    }
    return pages;
}

interface PageProps {
    params: Promise<{ page: string }>;
}

export default async function AnalysisSubPage({ params }: PageProps) {
    const resolvedParams = await params;
    const currentPage = Number(resolvedParams.page);

    const allReports = allStockReports.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const totalPages = Math.ceil(allReports.length / POSTS_PER_PAGE);
    const reports = allReports.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    return (
        <div className="space-y-8 pb-10">
            <section>
                <h1 className="text-3xl font-bold tracking-tight">종목 리포트 - {currentPage}페이지</h1>
                <p className="text-muted-foreground mt-2">개별 종목에 대한 심층 적인 펀더멘털 및 기술적 분석 리포트를 확인하세요.</p>
            </section>

            <div className="space-y-4">
                {reports.map((report) => (
                    <div key={report._id} className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                        {report.reportType}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{report.market} | {report.ticker}</span>
                                </div>
                                <Link href={report.url}>
                                    <h2 className="text-lg font-bold group-hover:text-primary transition-colors">
                                        {report.title}
                                    </h2>
                                </Link>
                                <p className="text-sm text-muted-foreground max-w-2xl line-clamp-1">
                                    {report.summary}
                                </p>
                            </div>

                            <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center md:space-y-2">
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground uppercase">투자의견</p>
                                        <p className="text-sm font-bold text-kr-up uppercase">{report.rating}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground uppercase">목표가</p>
                                        <p className="text-sm font-bold">
                                            {['NYSE', 'NASDAQ'].includes(report.market) 
                                                ? `$${report.targetPrice.toLocaleString()}` 
                                                : `${report.targetPrice.toLocaleString()}원`}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {format(parseISO(report.date), 'yyyy.MM.dd')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {allReports.length > POSTS_PER_PAGE && (
                <div className="flex items-center justify-center space-x-2 pt-8">
                    <Link
                        href={currentPage === 2 ? '/analysis' : `/analysis/page/${currentPage - 1}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-all hover:bg-primary hover:text-white hover:border-primary"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={page === 1 ? '/analysis' : `/analysis/page/${page}`}
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
                        href={currentPage < totalPages ? `/analysis/page/${currentPage + 1}` : '#'}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-all ${
                            currentPage < totalPages ? 'hover:bg-primary hover:text-white hover:border-primary' : 'pointer-events-none opacity-30'
                        }`}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Link>
                </div>
            )}
        </div>
    );
}
