import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import admin from 'firebase-admin';

const SIGN_KEY = process.env.INICIS_SIGN_KEY || "SU5JTElURV9UUklQTEVERVNfS0VZU1RS";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zipyojeong.vercel.app";

// HTML 리다이렉션 헬퍼 함수
function createRedirectResponse(url: string) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>리다이렉션 중...</title>
        </head>
        <body>
            <script>
                window.location.href = "${url}";
            </script>
        </body>
        </html>
    `;

    return new NextResponse(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=UTF-8',
        },
    });
}

// properties 함수들 - 프로덕션 환경
function getAuthUrl(idc_name: string): string {
    const url = "stdpay.inicis.com/api/payAuth";
    switch (idc_name) {
        case 'fc':
            return "https://fc" + url;
        case 'ks':
            return "https://ks" + url;
        case 'stg':
            return "https://stg" + url;
        default:
            return "https://" + url; // 프로덕션 기본값
    }
}

function getNetCancel(idc_name: string): string {
    const url = "stdpay.inicis.com/api/netCancel";
    switch (idc_name) {
        case 'fc':
            return "https://fc" + url;
        case 'ks':
            return "https://ks" + url;
        case 'stg':
            return "https://stg" + url;
        default:
            return "https://" + url; // 프로덕션 기본값
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const body: any = {};
        formData.forEach((value, key) => {
            body[key] = value;
        });

        console.log("결제 콜백 수신:", body);

        // 1. 인증 결과 확인
        if (body.resultCode !== "0000") {
            console.error("인증 실패:", body);
            return createRedirectResponse(
                `${BASE_URL}/checkout/fail?msg=${encodeURIComponent(body.resultMsg || '결제 인증 실패')}`
            );
        }

        // 2. 최종 승인 요청 파라미터 준비
        const mid = body.mid;
        const authToken = body.authToken;
        const timestamp = new Date().getTime();
        const charset = "UTF-8";
        const format = "JSON";

        const idc_name = body.idc_name;
        const authUrl = body.authUrl;
        const authUrl2 = getAuthUrl(idc_name);

        // SHA256 Hash값
        const signature = crypto.createHash("sha256")
            .update("authToken=" + authToken + "&timestamp=" + timestamp)
            .digest('hex');

        const verification = crypto.createHash("sha256")
            .update("authToken=" + authToken + "&signKey=" + SIGN_KEY + "&timestamp=" + timestamp)
            .digest('hex');

        // 3. 결제 승인 요청 파라미터
        const options = new URLSearchParams({
            mid: mid,
            authToken: authToken,
            timestamp: timestamp.toString(),
            signature: signature,
            verification: verification,
            charset: charset,
            format: format
        });

        // 4. authUrl 검증 - 일단 로그만 남기고 통과
        if (authUrl !== authUrl2) {
            console.warn("authUrl 불일치 (계속 진행):", { authUrl, authUrl2, idc_name });
        }

        // 5. 최종 승인 요청
        const approvalResponse = await fetch(authUrl2, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: options.toString()
        });

        const result = await approvalResponse.json();

        if (!result || result.resultCode !== "0000") {
            console.error("최종 승인 실패:", result);

            // 망취소 처리
            const netCancelUrl = body.netCancelUrl;
            const netCancelUrl2 = getNetCancel(idc_name);
            if (netCancelUrl === netCancelUrl2) {
                try {
                    await fetch(netCancelUrl2, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: options.toString()
                    });
                    console.log("망취소 요청 완료");
                } catch (cancelError) {
                    console.error("망취소 요청 실패:", cancelError);
                }
            }

            return createRedirectResponse(
                `${BASE_URL}/checkout/fail?msg=${encodeURIComponent(result?.resultMsg || '네트워크 오류')}`
            );
        }

        // 6. 최종 결제 성공
        console.log("결제 성공:", result);

        // Firestore에 결제 정보 저장 + 구독 자동 갱신
        try {
            const { adminDb } = await import('@/lib/firebase-admin');

            // 결제 정보 저장
            const paymentData = {
                tid: result.tid,
                orderId: result.MOID,
                mid: result.mid,
                amount: parseInt(result.TotPrice),
                productName: result.goodsName || body.goodname,
                payMethod: result.payMethod,
                status: 'completed',
                resultCode: result.resultCode,
                resultMsg: result.resultMsg,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            await adminDb.collection('payments').doc(result.MOID).set(paymentData);
            console.log('결제 정보 Firestore 저장 완료');

            // orderMappings에서 userId 조회
            let userId = null;
            try {
                const mappingDoc = await adminDb.collection('orderMappings').doc(result.MOID).get();
                if (mappingDoc.exists) {
                    userId = mappingDoc.data()?.userId;
                    console.log(`주문번호 매핑 조회 성공: ${result.MOID} -> ${userId}`);
                } else {
                    console.warn(`주문번호 매핑을 찾을 수 없습니다: ${result.MOID}`);
                }
            } catch (mappingError) {
                console.error('주문번호 매핑 조회 실패:', mappingError);
            }

            // 구독 정보 업데이트
            if (userId) {
                // 플랜 정보 결정 (금액 기반)
                const amount = parseInt(result.TotPrice);
                let planName = '';
                let planLevel = 0;

                if (amount >= 99000) {
                    planName = '프리미엄';
                    planLevel = 3;
                } else if (amount >= 49000) {
                    planName = '스탠다드';
                    planLevel = 2;
                } else if (amount >= 9900) {
                    planName = '베이직';
                    planLevel = 1;
                }

                if (planLevel > 0) {
                    const now = new Date();
                    const endDate = new Date(now);
                    endDate.setMonth(endDate.getMonth() + 1); // 1개월 후

                    const subscriptionData = {
                        planName,
                        planLevel,
                        status: 'active',
                        startDate: admin.firestore.Timestamp.fromDate(now),
                        endDate: admin.firestore.Timestamp.fromDate(endDate),
                        amount,
                        orderId: result.MOID,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    };

                    await adminDb.collection('users').doc(userId).set(
                        { subscription: subscriptionData },
                        { merge: true }
                    );

                    console.log(`사용자 ${userId}의 구독 정보 업데이트 완료: ${planName}`);
                }
            } else {
                console.warn('주문번호에서 userId를 추출할 수 없습니다:', result.MOID);
            }
        } catch (firestoreError) {
            console.error('Firestore 저장 실패:', firestoreError);
            // Firestore 저장 실패해도 결제는 성공이므로 계속 진행
        }

        // HTML로 응답하여 클라이언트 사이드에서 리다이렉션
        return createRedirectResponse(
            `${BASE_URL}/checkout/complete?oid=${result.MOID}&price=${result.TotPrice}`
        );

    } catch (error: any) {
        console.error("결제 콜백 처리 오류:", error);
        return createRedirectResponse(
            `${BASE_URL}/checkout/fail?msg=${encodeURIComponent('서버 오류가 발생했습니다')}`
        );
    }
}
