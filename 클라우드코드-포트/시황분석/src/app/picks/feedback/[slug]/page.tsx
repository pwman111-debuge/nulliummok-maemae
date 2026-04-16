export const dynamic = 'force-static';
export const dynamicParams = false;

import { allStockPickFeedbacks } from 'contentlayer2/generated';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Calendar, Tag, Share2, Bookmark, BarChart3, TrendingUp, AlertCircle, Info, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { MdxRenderer } from '@/components/content/MdxRenderer';
import { ShareButton } from '@/components/common/ShareButton';

export async function generateStaticParams() {
    return allStockPickFeedbacks.map((post) => ({
        slug: post._raw.flattenedPath.split('/').pop() || '',
    }));
}

export default async function PerformanceReviewDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = allStockPickFeedbacks.find(
        (p) => p._raw.flattenedPath.split('/').pop() === slug
    );

    if (!post) notFound();

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link
                href="/picks/feedback"
                className="inline-flex items-center text-sm font-black text-muted-foreground hover:text-violet-500 mb-10 transition-all duration-300 group"
            >
                <div className="bg-muted p-1.5 rounded-lg mr-3 group-hover:bg-violet-500 group-hover:text-white transition-all">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                목록으로 돌아가기
            </Link>

            <article className="rounded-[3rem] border border-border bg-card overflow-hidden shadow-2xl shadow-slate-200/50">
                <header className="p-10 md:p-16 border-b border-border bg-gradient-to-br from-violet-500/5 to-transparent relative">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <ClipboardCheck className="h-32 w-32" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase mb-8 relative z-10">
                        <span className="rounded-xl bg-violet-500/10 px-4 py-2 text-violet-600 border border-violet-500/10 shadow-sm">투자 성과 리포트</span>
                        <div className="flex items-center text-muted-foreground bg-muted/50 px-4 py-2 rounded-xl">
                            <Calendar className="mr-2 h-4 w-4" />
                            {format(parseISO(post.date), 'yyyy년 MM월 dd일')}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8 leading-tight relative z-10">
                        {post.title}
                    </h1>

                    <p className="text-xl text-muted-foreground leading-relaxed font-medium mb-10 max-w-2xl relative z-10">
                        {post.summary}
                    </p>

                    <div className="pt-8 border-t border-border flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-6">
                            <ShareButton
                                title={post.title}
                                text={post.summary}
                                url={`https://stockanalysis2.pages.dev/picks/feedback/${slug}`}
                                className="text-xs font-black"
                            />
                            <button className="flex items-center space-x-2 text-xs font-black text-muted-foreground hover:text-violet-500 transition-colors">
                                <Bookmark className="h-4 w-4" />
                                <span>저장하기</span>
                            </button>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                            <TrendingUp className="h-4 w-4" />
                            공식 성과 분석 완료
                        </div>
                    </div>
                </header>

                <div className="p-10 md:p-16 prose prose-slate max-w-none 
                    prose-headings:font-black prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                    prose-p:leading-relaxed prose-p:text-lg prose-p:text-slate-600
                    prose-strong:text-slate-900 prose-blockquote:border-violet-500
                    prose-table:border prose-table:rounded-2xl prose-table:overflow-hidden
                    prose-thead:bg-slate-50 prose-th:px-6 prose-th:py-4 prose-th:text-xs prose-th:font-black prose-th:uppercase prose-th:tracking-widest
                    prose-td:px-6 prose-td:py-5 prose-td:border-t prose-td:text-slate-600 font-medium">
                    <MdxRenderer code={post.body.code} />
                </div>

                <footer className="px-10 md:px-16 py-12 border-t border-border bg-slate-50/50">
                    <div className="flex flex-wrap gap-2.5 mb-10">
                        {post.tags?.map((tag) => (
                            <span key={tag} className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-[11px] font-black text-slate-500 border border-slate-200 shadow-sm hover:border-violet-200 hover:text-violet-500 transition-all cursor-default">
                                #{tag}
                            </span>
                        ))}
                    </div>
                    <div className="p-6 rounded-[2rem] bg-violet-600 text-white flex gap-5 shadow-xl shadow-violet-200">
                        <div className="bg-white/20 p-2.5 rounded-2xl h-fit">
                            <Info className="h-6 w-6 text-white" />
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-lg">성과 분석 가이드</p>
                            <p className="text-sm text-violet-100 leading-relaxed font-medium">
                                본 리포트는 추천 당시 제시했던 전략을 기준으로 도달 여부를 객관적으로 추적한 결과입니다. <br />
                                시장의 갑작스러운 변동성이나 개별 기업의 돌발 악재 발생 시 성과가 달라질 수 있으므로, 항상 본인의 투자 원칙을 우선하시기 바랍니다.
                            </p>
                        </div>
                    </div>
                </footer>
            </article>
        </div>
    );
}
