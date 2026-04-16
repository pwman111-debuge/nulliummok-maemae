
import Link from "next/link";

export function Footer() {
    return (
        <footer className="mt-auto border-t border-border bg-white px-8 py-10">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <div className="mr-3 h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="font-bold text-background text-xs">GR</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                Genesis Report
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            데이터 기반 한국 증시 인사이트 플랫폼.<br />
                            투자자들을 위한 최적의 정보와 분석을 제공합니다.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">메뉴</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-primary">대시보드</Link></li>
                            <li><Link href="/market" className="hover:text-primary">시황 분석</Link></li>
                            <li><Link href="/insight" className="hover:text-primary">마켓 인사이트</Link></li>
                            <li><Link href="/picks" className="hover:text-primary">유망 종목</Link></li>
                            <li><Link href="/picks/feedback" className="hover:text-primary">투자 성과 리포트</Link></li>
                            <li><Link href="/analysis" className="hover:text-primary">종목 리포트</Link></li>
                            <li><Link href="/calendar" className="hover:text-primary">경제 캘린더</Link></li>
                            <li><Link href="/education" className="hover:text-primary">투자 교육</Link></li>
                        </ul>
                    </div>


                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">정보</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary">서비스 소개</Link></li>
                            <li><Link href="/contact" className="hover:text-primary">문의하기</Link></li>
                            <li><Link href="/privacy" className="font-medium text-foreground hover:text-primary">개인정보처리방침</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">이용약관</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">문의</h3>
                        <Link
                            href="/contact"
                            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                        >
                            전용 문의 폼 바로가기
                            <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>

                <div className="mt-10 border-t border-border pt-8 text-center">
                    <div className="mb-4 rounded-lg bg-accent/30 p-4 text-xs leading-5 text-muted-foreground">
                        <p className="font-bold mb-1">[투자 면책조항]</p>
                        본 서비스에서 제공하는 모든 정보는 투자 판단의 참고용이며, 투자 권유를 목적으로 하지 않습니다.
                        정보의 정확성을 위해 노력하나 오류나 지연이 발생할 수 있습니다.
                        모든 투자의 최종 결과와 책임은 투자자 본인에게 있습니다.
                    </div>
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} 제네시스 주식 리포트. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
