export const dynamic = 'force-static';
export const dynamicParams = false;

import { allMarketAnalyses } from 'contentlayer2/generated';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Calendar, Tag, Share2, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { MdxRenderer } from '@/components/content/MdxRenderer';
import { ShareButton } from '@/components/common/ShareButton';

export async function generateStaticParams() {
    return allMarketAnalyses.map((post) => ({
        slug: post._raw.flattenedPath.split('/').pop() || '',
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = allMarketAnalyses.find(
        (p) => p._raw.flattenedPath.split('/').pop() === slug
    );

    if (!post) return {};

    const imageUrl = '/og-image.png';

    return {
        title: post.title,
        description: post.summary,
        openGraph: {
            title: post.title,
            description: post.summary,
            type: 'article',
            url: `https://stockanalysis2.pages.dev/market/${slug}`,
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

export default async function MarketDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = allMarketAnalyses.find(
        (p) => p._raw.flattenedPath.split('/').pop() === slug
    );

    if (!post) notFound();

    return (
        <div className="max-w-4xl mx-auto pb-20 px-4 sm:px-0">
            <Link
                href="/market"
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로 돌아가기
            </Link>

            <article className="rounded-2xl border border-border bg-card p-4 sm:p-8 md:p-12 shadow-sm break-words overflow-hidden">
                <header className="mb-10 text-center">
                    <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-primary uppercase mb-4">
                        <span className="rounded-full bg-primary/10 px-3 py-1">{post.category}</span>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {format(parseISO(post.date), 'yyyy년 MM월 dd일')}
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                        {post.title}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        {post.summary}
                    </p>

                    <div className="mt-8 pt-8 border-t border-border flex items-center justify-center space-x-4">
                        <ShareButton 
                            title={post.title}
                            text={post.summary}
                            url={`https://stockanalysis2.pages.dev/market/${slug}`}
                        />
                        <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Bookmark className="h-4 w-4" />
                            <span>저장</span>
                        </button>
                    </div>
                </header>

                <div className="prose prose-slate max-w-none">
                    <MdxRenderer code={post.body.code} />
                </div>

                <footer className="mt-12 pt-8 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                        {post.tags?.map((tag) => (
                            <span key={tag} className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground border border-border">
                                <Tag className="mr-1 h-3 w-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </footer>
            </article>
        </div>
    );
}
