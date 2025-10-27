// src/app/checkout/fail/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

function PaymentFailContent() {
    const searchParams = useSearchParams();
    const msg = searchParams.get('msg');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-gray-950">
            <Card className="max-w-md w-full p-6 text-center shadow-2xl border-t-4 border-red-500 dark:bg-gray-900">
                <CardHeader className="flex flex-col items-center">
                    <XCircle className="w-16 h-16 text-red-500 mb-4" />
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        결제에 실패하였습니다. 😔
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        결제 정보나 네트워크 상태를 확인 후 다시 시도해 주세요.
                    </p>

                    <div className="text-left p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>실패 사유:</strong>
                            <span className="font-medium text-red-600 dark:text-red-400 ml-2">{msg || '알 수 없는 오류'}</span>
                        </p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <Link href="/pricing" passHref>
                            <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                                다시 시도하기 (요금제 선택)
                            </Button>
                        </Link>
                        <Link href="/" passHref>
                            <Button variant="outline" className="w-full text-gray-700 dark:text-gray-300 dark:border-gray-700">
                                메인 페이지로 돌아가기
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentFailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-gray-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">결제 결과 확인 중...</p>
                </div>
            </div>
        }>
            <PaymentFailContent />
        </Suspense>
    );
}