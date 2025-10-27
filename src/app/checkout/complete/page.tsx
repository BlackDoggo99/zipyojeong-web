// src/app/checkout/complete/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const oid = searchParams.get('oid');
    const price = searchParams.get('price');

    // 금액을 숫자 형식으로 변환하여 콤마 추가
    const formattedPrice = price ? parseInt(price).toLocaleString() : '0';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 dark:bg-gray-950">
            <Card className="max-w-md w-full p-6 text-center shadow-2xl border-t-4 border-green-500 dark:bg-gray-900">
                <CardHeader className="flex flex-col items-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        결제가 성공적으로 완료되었습니다! 🎉
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        집요정 프리미엄 서비스를 이용해 보세요.
                    </p>

                    <div className="text-left p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>주문번호 (MOID):</strong>
                            <span className="font-mono text-xs ml-2 text-indigo-600 dark:text-indigo-400">{oid || '확인 불가'}</span>
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>결제 금액:</strong>
                            <span className="font-bold text-lg ml-2 text-green-600 dark:text-green-400">₩{formattedPrice}</span>원
                        </p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <Link href="/dashboard" passHref>
                            <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
                                서비스 시작하기 (대시보드 이동)
                            </Button>
                        </Link>
                        <Link href="/pricing" passHref>
                            <Button variant="outline" className="w-full text-gray-700 dark:text-gray-300 dark:border-gray-700">
                                요금제 페이지로 돌아가기
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 dark:bg-gray-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">결제 결과 확인 중...</p>
                </div>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}