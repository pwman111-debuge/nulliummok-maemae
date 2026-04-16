export const dynamicParams = false;

import { allStockReports } from 'contentlayer2/generated';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Calendar, Tag, Share2, Bookmark, BarChart3, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { MdxRenderer } from '@/components/content/MdxRenderer';

import { ShareButton } from '@/components/common/ShareButton';

export async function generateStaticParams() {
    return allStockReports.map((post) => ({
        slug: post._raw.flattenedPath.split('/').pop() || '',
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = allStockReports.find(
        (p) => p._raw.flattenedPath.split('/').pop() === slug
    );

    if (!post) return {};

    const imageUrl = '/og-image.png'; // thumbnail 필드가 없으므로 기본 이미지 사용

    return {
        title: `${post.title} | KRX Intelligence`,
        description: post.summary,
        openGraph: {
            title: post.title,
            description: post.summary,
            type: 'article',
            url: `https://stockanalysis2.pages.dev/analysis/${slug}`,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.summary,
            images: [imageUrl],
        },
    };
}

export default async function StockReportDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = allStockReports.find(
        (p) => p._raw.flattenedPath.split('/').pop() === slug
    );

    if (!post) notFound();

    return (
        <div className="max-w-4xl mx-auto pb-20 px-4">
            <Link
                href="/analysis"
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로 돌아가기
            </Link>

            <article className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm mx-auto">
                <header className="p-6 md:p-12 border-b border-border bg-muted/5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase mb-6">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{post.reportType}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{post.market} | {post.ticker}</span>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {format(parseISO(post.date), 'yyyy년 MM월 dd일')}
                        </div>
                    </div>

                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-6">
                        {post.title}
                    </h1>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-8">
                        <div className="p-3 md:p-4 rounded-xl bg-background border border-border">
                            <p className="text-[10px] text-muted-foreground uppercase mb-1">투자의견</p>
                            <p className="text-base md:text-lg font-bold text-kr-up uppercase">{post.rating}</p>
                        </div>
                        <div className="p-3 md:p-4 rounded-xl bg-background border border-border">
                            <p className="text-[10px] text-muted-foreground uppercase mb-1">목표가</p>
                            <p className="text-base md:text-lg font-bold">
                                {['NYSE', 'NASDAQ'].includes(post.market) 
                                    ? `$${post.targetPrice.toLocaleString()}` 
                                    : `${post.targetPrice.toLocaleString()}원`}
                            </p>
                        </div>
                        <div className="p-3 md:p-4 rounded-xl bg-background border border-border">
                            <p className="text-[10px] text-muted-foreground uppercase mb-1">현재가</p>
                            <p className="text-base md:text-lg font-bold">
                                {['NYSE', 'NASDAQ'].includes(post.market) 
                                    ? `$${post.currentPrice.toLocaleString()}` 
                                    : `${post.currentPrice.toLocaleString()}원`}
                            </p>
                        </div>
                        <div className="p-3 md:p-4 rounded-xl bg-background border border-border">
                            <p className="text-[10px] text-muted-foreground uppercase mb-1">상승여력</p>
                            <p className="text-base md:text-lg font-bold text-kr-up">{post.priceUpside}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <ShareButton 
                                title={post.title}
                                text={post.summary}
                                url={`https://stockanalysis2.pages.dev/analysis/${slug}`}
                            />
                            <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                                <Bookmark className="h-4 w-4" />
                                <span className="hidden sm:inline">저장</span>
                            </button>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                            섹터: <span className="text-foreground">{post.sector}</span>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-12 prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-p:leading-relaxed break-words overflow-x-hidden">
                    <MdxRenderer code={post.body.code} />
                </div>

                <footer className="px-6 md:px-12 py-8 border-t border-border bg-muted/5">
                    <div className="flex flex-wrap gap-2">
                        {post.tags?.map((tag) => (
                            <span key={tag} className="inline-flex items-center rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground border border-border">
                                <Tag className="mr-1 h-3 w-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                    <p className="mt-8 text-xs text-muted-foreground italic">
                        * 본 리포트는 제네시스 AI 분석 알고리즘에 의해 작성되었으며, 투자 결과에 대한 책임은 투자 본인에게 있습니다.
                    </p>
                </footer>
            </article>
        </div>
    );
}
