
import { StockChart } from '@/components/common/StockChart';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';

export default function TestChartPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">실시간 차트 도입 시뮬레이션</h1>
                <p className="text-muted-foreground">
                    네이버 페이 증권의 실시간 주가 데이터(API)를 <b>Lightweight Charts</b> 라이브러리와 연결하여 구현한 예시입니다.
                </p>
                <div className="mt-4 flex space-x-2">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">비용 $0</span>
                    <span className="bg-success/10 text-success px-3 py-1 rounded-full text-xs font-semibold">실시간 수집</span>
                    <span className="bg-accent/50 text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold italic">Apache License 2.0</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <StockChart 
                    code="KOSPI" 
                    title="KOSPI" 
                    className="flex-1"
                />
                
                <StockChart 
                    code="KOSDAQ" 
                    title="KOSDAQ" 
                    className="flex-1"
                />
            </div>
            
            <section className="bg-white rounded-2xl border border-border p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-4">어떻게 구현되었나요?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                            <span className="font-bold text-lg">1</span>
                        </div>
                        <h3 className="font-semibold mb-2">데이터 수집 (Scraping)</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            네이버 증권의 공개된 API에서 실시간 주가 히스토리를 긁어옵니다. 유료 API 비용이 발생하지 않습니다.
                        </p>
                    </div>
                    <div>
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                            <span className="font-bold text-lg">2</span>
                        </div>
                        <h3 className="font-semibold mb-2">프록시 API (API Route)</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            CORS 문제를 방지하기 위해 Next.js의 API Route를 통해 안전하게 데이터를 전달합니다.
                        </p>
                    </div>
                    <div>
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                            <span className="font-bold text-lg">3</span>
                        </div>
                        <h3 className="font-semibold mb-2">시각화 (Lightweight Charts)</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            오픈 소스 라이브러리를 사용해 토스 앱 수준의 부드러운 차트를 우리 웹사이트 디자인에 맞춰 렌더링합니다.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
