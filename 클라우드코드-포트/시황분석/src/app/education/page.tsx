import { allEducation, type Education } from 'contentlayer2/generated';
import { BookOpen, GraduationCap, TrendingUp, BarChart3, Shield, Target, ArrowRight, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// 정적 카테고리 정의 (추후 확장 가능)
const CATEGORIES = [
    { title: '주식 투자 기초', icon: GraduationCap, color: 'bg-blue-50 border-blue-200 text-blue-700', iconColor: 'text-blue-600' },
    { title: '기술적 분석', icon: TrendingUp, color: 'bg-green-50 border-green-200 text-green-700', iconColor: 'text-green-600' },
    { title: '펀더멘털 분석', icon: BarChart3, color: 'bg-purple-50 border-purple-200 text-purple-700', iconColor: 'text-purple-600' },
    { title: '단기 매매', icon: Zap, color: 'bg-orange-50 border-orange-200 text-orange-700', iconColor: 'text-orange-600' },
    { title: '리스크 관리', icon: Shield, color: 'bg-red-50 border-red-200 text-red-700', iconColor: 'text-red-600' },
];

const LEVEL_STYLE: Record<string, string> = {
    '초급': 'bg-green-100 text-green-700',
    '중급': 'bg-blue-100 text-blue-700',
    '고급': 'bg-purple-100 text-purple-700',
};

export default function EducationPage() {
    // 카테고리별로 작성된 교육 콘텐츠 분류하기
    const articlesByCategory = CATEGORIES.map(cat => ({
        ...cat,
        articles: allEducation.filter(post => post.category === cat.title).sort((a: Education, b: Education) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }));

    // 총 작성된 아티클 계산
    const totalArticles = allEducation.length;
    const initialArticlesCount = allEducation.filter((a: Education) => a.level === '초급').length;
    const advancedArticlesCount = allEducation.filter((a: Education) => a.level === '고급').length;

    return (
        <div className="space-y-8 pb-10">
            <section>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-primary" />
                    투자 교육
                </h1>
                <p className="text-muted-foreground mt-2">
                    체계적인 투자 학습으로 나만의 투자 원칙을 세워보세요. 초급부터 고급까지 단계별로 구성되어 있습니다.
                </p>
            </section>

            {/* Learning Path Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm text-center">
                    <p className="text-xs font-medium text-muted-foreground uppercase">분류된 카테고리</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{CATEGORIES.length}개</p>
                </div>
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm text-center">
                    <p className="text-xs font-medium text-muted-foreground uppercase">총 콘텐츠</p>
                    <p className="mt-1 text-2xl font-bold text-primary">
                        {totalArticles}편
                    </p>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm text-center">
                    <p className="text-xs font-medium text-green-600 uppercase">초급 과정</p>
                    <p className="mt-1 text-2xl font-bold text-green-700">
                        {initialArticlesCount}편
                    </p>
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 shadow-sm text-center">
                    <p className="text-xs font-medium text-purple-600 uppercase">고급 과정</p>
                    <p className="mt-1 text-2xl font-bold text-purple-700">
                        {advancedArticlesCount}편
                    </p>
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-8">
                {articlesByCategory.map((cat) => (
                    <div key={cat.title} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                        <div className={cn("flex items-center gap-3 px-6 py-4 border-b bg-gray-50/50", cat.color)}>
                            <cat.icon className={cn("h-6 w-6 mt-0.5", cat.iconColor)} />
                            <h2 className="text-lg font-bold">{cat.title}</h2>
                            <span className="text-xs font-medium ml-auto px-2 border rounded-full bg-white opacity-80">{cat.articles.length}편</span>
                        </div>
                        <div className="divide-y divide-border">
                            {cat.articles.length > 0 ? cat.articles.map((article, idx) => (
                                <Link href={article.url} key={article._id} className="group flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted shadow-sm text-xs font-bold text-muted-foreground border border-gray-200">
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold group-hover:text-primary transition-colors mb-0.5 text-zinc-900">
                                                {article.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                                                    <Clock className="h-3 w-3" /> {article.time}
                                                </span>
                                                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight shadow-sm border", LEVEL_STYLE[article.level])}>
                                                    {article.level}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                </Link>
                            )) : (
                                <div className="px-6 py-8 text-center text-muted-foreground text-sm italic">
                                    이 카테고리에 등록된 강의가 아직 없습니다. 곧 추가됩니다!
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Coming Soon Banner */}
            <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                <Target className="h-10 w-10 mx-auto mb-3 text-primary opacity-50" />
                <h3 className="text-lg font-bold text-foreground">더 많은 콘텐츠 준비 중</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    퀀트 투자, ETF 전략, 해외 주식 등 다양한 주제가 곧 추가될 예정입니다.
                </p>
            </div>
        </div>
    );
}
