export const dynamic = 'force-static';
export const dynamicParams = false;

import { allStockPicks } from 'contentlayer2/generated';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Calendar, Tag, Share2, Bookmark, Target, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { MdxRenderer } from '@/components/content/MdxRenderer';
import { ShareButton } from '@/components/common/ShareButton';

export async function generateStaticParams() {
    return allStockPicks.map((post) => ({
        slug: post._raw.flattenedPath.split('/').pop() || '',
    }));
}

export default async function StockPickDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = allStockPicks.find(
        (p) => p._raw.flattenedPath.split('/').pop() === slug
    );

    if (!post) notFound();

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link
                href="/picks"
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로 돌아가기
            </Link>

            <article className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <header className="p-8 md:p-12 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase mb-6">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">유망 종목 분석</span>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {format(parseISO(post.date), 'yyyy년 MM월 dd일')}
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
                        {post.title}
                    </h1>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                        <div className="p-5 rounded-2xl bg-background border border-border shadow-sm">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1 tracking-wider">목표가</p>
                            <p className="text-xl font-black text-kr-up">{post.targetPrice > 0 ? post.targetPrice.toLocaleString() + '원' : '상세내용 확인'}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-background border border-border shadow-sm">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1 tracking-wider">손절가</p>
                            <p className="text-xl font-black text-kr-down">{post.stopLoss > 0 ? post.stopLoss.toLocaleString() + '원' : '상세내용 확인'}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-background border border-border shadow-sm">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1 tracking-wider">기대 수익률</p>
                            <p className="text-xl font-black text-primary">{post.expectedReturn || '상세내용 확인'}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <ShareButton 
                                title={post.title}
                                text={post.summary}
                                url={`https://stockanalysis2.pages.dev/picks/${slug}`}
                                className="text-xs"
                            />
                            <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                <Bookmark className="h-4 w-4" />
                                <span>저장</span>
                            </button>
                        </div>
                        <div className="text-xs font-bold px-3 py-1 rounded-full bg-muted">
                            투자 기간: <span className="text-primary">{post.holdingPeriod || '단기'}</span>
                        </div>
                    </div>
                </header>

                <div className="p-8 md:p-12 prose prose-slate max-w-none 
                    prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                    prose-p:leading-relaxed prose-li:my-1 prose-strong:text-foreground">
                    <MdxRenderer code={post.body.code} />
                </div>

                <footer className="px-8 md:px-12 py-8 border-t border-border bg-muted/5">
                    <div className="flex flex-wrap gap-2">
                        {post.tags?.map((tag) => (
                            <span key={tag} className="inline-flex items-center rounded-lg bg-card px-3 py-1 text-[11px] font-bold text-muted-foreground border border-border">
                                #{tag}
                            </span>
                        ))}
                    </div>
                    <div className="mt-10 p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />
                        <p className="text-xs text-orange-700 leading-normal">
                            본 리포트는 제네시스 AI 분석 알고리즘에 의해 금일 수급과 기술적 지표를 기반으로 작성되었습니다. 모든 투자의 책임은 본인에게 있으며, 시장 변동성에 유의하시기 바랍니다.
                        </p>
                    </div>
                </footer>
            </article>
        </div>
    );
}
