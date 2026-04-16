export const dynamic = 'force-static';
export const dynamicParams = false;

import { notFound } from 'next/navigation';
import { allEducation } from 'contentlayer2/generated';
import { MdxWrapper } from '@/components/mdx/MdxWrapper';
import { BookOpen, Clock, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export async function generateStaticParams() {
    return allEducation.map((post: any) => ({
        slug: post.slug,
    }));
}

const LEVEL_STYLE: Record<string, string> = {
    '초급': 'bg-green-100 text-green-700',
    '중급': 'bg-blue-100 text-blue-700',
    '고급': 'bg-purple-100 text-purple-700',
};

// MDX 컴포넌트 스타일링은 MdxWrapper 내부에서 처리됩니다.

interface EducationPostPageProps {
    params: Promise<{ slug: string }>;
}

export default async function EducationPostPage({ params }: EducationPostPageProps) {
    const { slug } = await params;
    const post = allEducation.find((p: any) => p.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="max-w-3xl mx-auto py-8 px-4 pb-20">
            {/* 상단 네비게이션 */}
            <Link
                href="/education"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-full"
            >
                <ArrowLeft className="h-4 w-4" />
                목록으로 돌아가기
            </Link>

            {/* 헤더 섹션 */}
            <header className="mb-10 text-center space-y-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        {post.category}
                    </span>
                    <span className={cn("text-xs font-bold px-3 py-1 rounded-full", LEVEL_STYLE[post.level])}>
                        {post.level}
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                    {post.title}
                </h1>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto italic">
                    {post.summary}
                </p>

                <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={post.date}>
                            {format(new Date(post.date), 'yyyy년 MM월 dd일')}
                        </time>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>읽는 시간 {post.time}</span>
                    </div>
                </div>
            </header>

            {/* 본문 콘텐츠 섹션 */}
            <div className="prose prose-zinc prose-lg min-w-full bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-border">
                <MdxWrapper code={post.body.code} />
            </div>

            <div className="mt-12 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-4">학습을 완료하셨나요?</p>
                <Link
                    href="/education"
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all font-bold"
                >
                    <BookOpen className="mr-2 h-5 w-5" />
                    다음 강의 학습하기
                </Link>
            </div>
        </article>
    );
}
