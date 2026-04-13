
import { allMarketInsights } from 'contentlayer2/generated';
import { compareDesc, format, parseISO } from 'date-fns';
import { Zap, ArrowRight, Calendar, Tag, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';

const POSTS_PER_PAGE = 9;

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    const totalPages = Math.ceil(allMarketInsights.length / POSTS_PER_PAGE);

    // 2페이지부터 생성
    const pages = Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
        page: (i + 2).toString(),
    }));

    // 빌드 안정성을 위해 최소 2페이지는 예약
    if (pages.length === 0) {
        return [{ page: '2' }];
    }
    return pages;
}

interface PageProps {
    params: Promise<{ page: string }>;
}

export default async function MarketInsightSubPage({ params }: PageProps) {
    const resolvedParams = await params;
    const currentPage = Number(resolvedParams.page);

    const allPosts = allMarketInsights.sort((a, b) =>
        compareDesc(parseISO(a.date), parseISO(b.date))
    );

    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
    const posts = allPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    return (
        <div className="space-y-8 pb-10">
            <section>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">마켓 인사이트 - {currentPage}페이지</h1>
                        <p className="text-muted-foreground mt-1">FOMC, 거시 경제 지표 분석 및 시장의 핵심 이슈를 심층적으로 다룹니다.</p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <article key={post._id} className="group relative flex flex-col space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {format(parseISO(post.date), 'yyyy년 MM월 dd일')}
                            </div>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-[10px] uppercase">
                                {post.category}
                            </span>
                        </div>

                        <div className="flex-1">
                            <Link href={post.url} className="block">
                                <h2 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                    {post.title}
                                </h2>
                                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                                    {post.summary}
                                </p>
                            </Link>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-border/50">
                            <div className="flex flex-wrap gap-1">
                                {post.tags?.slice(0, 2).map((tag) => (
                                    <span key={tag} className="inline-flex items-center text-[10px] text-muted-foreground">
                                        <Tag className="mr-1 h-2 w-2" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <Link href={post.url} className="text-xs font-semibold text-primary flex items-center group-hover:translate-x-1 transition-transform">
                                읽어보기 <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </div>
                    </article>
                ))}
            </div>

            {allPosts.length > POSTS_PER_PAGE && (
                <div className="flex items-center justify-center space-x-2 pt-8">
                    <Link
                        href={currentPage === 2 ? '/insight' : `/insight/page/${currentPage - 1}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={page === 1 ? '/insight' : `/insight/page/${page}`}
                            className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${currentPage === page
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border hover:bg-accent hover:text-accent-foreground'
                                }`}
                        >
                            {page}
                        </Link>
                    ))}

                    <Link
                        href={currentPage < totalPages ? `/insight/page/${currentPage + 1}` : '#'}
                        className={`flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors ${currentPage < totalPages ? 'hover:bg-accent hover:text-accent-foreground' : 'pointer-events-none opacity-50'
                            }`}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
