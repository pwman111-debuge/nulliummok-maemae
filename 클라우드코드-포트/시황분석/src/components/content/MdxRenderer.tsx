"use client";

import { useMDXComponent } from 'next-contentlayer2/hooks';
import { PortfolioChart } from '@/components/dashboard/MainIndexCharts';
import { CustomStockChart } from '@/components/mdx/CustomStockChart';

// MDX 컴포넌트 커스텀 스타일 정의
const mdxComponents = {
    h1: (props: any) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
    h2: (props: any) => <h2 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
    h3: (props: any) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
    p: (props: any) => <p className="leading-7 mb-4 text-slate-700" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
    li: (props: any) => <li className="text-slate-700" {...props} />,
    table: (props: any) => (
        <div className="overflow-x-auto my-6 border rounded-lg">
            <table className="min-w-full divide-y divide-border" {...props} />
        </div>
    ),
    thead: (props: any) => <thead className="bg-muted/50" {...props} />,
    th: (props: any) => <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground" {...props} />,
    td: (props: any) => <td className="px-4 py-3 text-sm border-t border-border" {...props} />,
    blockquote: (props: any) => <blockquote className="border-l-4 border-primary bg-muted/30 p-4 italic my-6 text-slate-600 rounded-r-lg" {...props} />,
    code: (props: any) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props} />,
    pre: (props: any) => <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-6 text-sm" {...props} />,
    PortfolioChart: (props: any) => (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm overflow-hidden my-6">
            <h3 className="text-sm font-bold text-muted-foreground mb-4 px-2">{props.title}</h3>
            <PortfolioChart {...props} />
        </div>
    ),
    StockChart: CustomStockChart,
};

interface MdxRendererProps {
    code: string;
}

export function MdxRenderer({ code }: MdxRendererProps) {
    const Component = useMDXComponent(code);
    return <Component components={mdxComponents} />;
}
