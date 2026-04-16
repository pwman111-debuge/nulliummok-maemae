
import React from 'react';

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8">이용약관</h1>

            <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제1조 (목적)</h2>
                    <p>본 약관은 제네시스 주식 리포트(이하 '서비스')가 제공하는 모든 정보 및 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제2조 (정보의 성격 및 책임 제한)</h2>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>본 서비스는 주식 시장에 관한 일반적인 정보와 분석을 제공하며, 특정 종목에 대한 투자 권유나 자문을 목적으로 하지 않습니다.</li>
                        <li className="font-semibold text-red-600 underline">제공되는 모든 데이터와 정보는 오류나 지연이 발생할 수 있으며, 서비스는 정보의 정확성이나 완전성을 보장하지 않습니다.</li>
                        <li className="font-semibold text-red-600 underline">모든 투자의 책임은 투자자 본인에게 있으며, 서비스에서 제공하는 정보를 바탕으로 행해진 투자 결과에 대해 회사는 어떠한 법적 책임도 지지 않습니다.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제3조 (서비스 중단)</h2>
                    <p>회사는 시스템 점검, 교체 및 고장, 통신 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제4조 (저작권)</h2>
                    <p>서비스가 제공하는 모든 콘텐츠에 대한 저작권 및 기타 지식재산권은 회사에 귀속됩니다. 이용자는 서비스를 통해 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포 등을 할 수 없습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제5조 (약관의 개정)</h2>
                    <p>회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정 시 서비스 내 공지사항을 통해 고지합니다.</p>
                </section>

                <p className="pt-8 border-t border-border mt-10">
                    심행일: 2026년 3월 14일
                </p>
            </div>
        </div>
    );
}
