import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

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

// properties 함수 - 프로덕션 환경
function getAuthUrl(idc_name: string): string {
    const url = "mobile.inicis.com/smart/payReq.ini";
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

        console.log("모바일 결제 콜백 수신:", body);

        // 1. 인증 결과 확인
        if (body.P_STATUS !== "00") {
            console.error("모바일 인증 실패:", body);
            return createRedirectResponse(
                `${BASE_URL}/checkout/fail?msg=${encodeURIComponent(body.P_RMESG1 || '결제 인증 실패')}`
            );
        }

        // 2. 최종 승인 요청 파라미터 준비
        const P_TID = body.P_TID;
        const P_MID = P_TID.substring(10, 20); // TID에서 MID 추출

        const idc_name = body.idc_name;
        const P_REQ_URL = body.P_REQ_URL;

        // 3. URL 로그 출력 - KG Inicis가 보내준 URL 사용
        console.log("모바일 결제 승인 요청:", { P_REQ_URL, idc_name });

        // 4. 최종 승인 요청 - KG Inicis가 보내준 P_REQ_URL 사용
        const approvalParams = new URLSearchParams({
            P_MID: P_MID,
            P_TID: P_TID
        });

        const approvalResponse = await fetch(P_REQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: approvalParams.toString()
        });

        const resultText = await approvalResponse.text();

        // 5. 응답 파싱 (& 구분자로 분리)
        const resultMap: Record<string, string> = {};
        const values = resultText.split('&');
        for (const item of values) {
            const i = item.indexOf('=');
            if (i > 0) {
                const key = item.substring(0, i);
                const value = item.substring(i + 1);
                resultMap[key] = value;
            }
        }

        console.log("모바일 승인 결과:", resultMap);

        // 6. 승인 결과 확인
        if (resultMap.P_STATUS !== "00") {
            console.error("모바일 최종 승인 실패:", resultMap);

            // 망취소 처리 (필요 시)
            // TODO: 망취소 로직 추가

            return createRedirectResponse(
                `${BASE_URL}/checkout/fail?msg=${encodeURIComponent(resultMap.P_RMESG1 || '결제 승인 실패')}`
            );
        }

        // 7. 결제 성공
        console.log("모바일 결제 성공:", resultMap);

        // Firestore에 결제 정보 저장 + 구독 자동 갱신
        try {
            const { adminDb } = await import('@/lib/firebase-admin');

            // 결제 정보 저장
            const paymentData = {
                tid: resultMap.P_TID,
                orderId: resultMap.P_OID,
                mid: resultMap.P_MID,
                amount: parseInt(resultMap.P_AMT),
                productName: resultMap.P_GOODS,
                payMethod: resultMap.P_TYPE,
                status: 'completed',
                resultCode: resultMap.P_STATUS,
                resultMsg: resultMap.P_RMESG1,
                isMobile: true,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            await adminDb.collection('payments').doc(resultMap.P_OID).set(paymentData);
            console.log('모바일 결제 정보 Firestore 저장 완료');

            // orderMappings에서 userId 조회
            let userId = null;
            try {
                const mappingDoc = await adminDb.collection('orderMappings').doc(resultMap.P_OID).get();
                if (mappingDoc.exists) {
                    userId = mappingDoc.data()?.userId;
                    console.log(`모바일 주문번호 매핑 조회 성공: ${resultMap.P_OID} -> ${userId}`);
                } else {
                    console.warn(`주문번호 매핑을 찾을 수 없습니다: ${resultMap.P_OID}`);
                }
            } catch (mappingError) {
                console.error('주문번호 매핑 조회 실패:', mappingError);
            }

            // 구독 정보 업데이트
            if (userId) {
                const amount = parseInt(resultMap.P_AMT);
                let planName = '';
                let planLevel = 0;
                let planId: 'free' | 'starter' | 'basic' | 'standard' | 'pro' = 'free';

                if (amount >= 99000) {
                    planName = '프리미엄';
                    planLevel = 3;
                    planId = 'pro';
                } else if (amount >= 49000) {
                    planName = '스탠다드';
                    planLevel = 2;
                    planId = 'standard';
                } else if (amount >= 14900) {
                    planName = '스타터';
                    planLevel = 1;
                    planId = 'starter';
                } else if (amount >= 9900) {
                    planName = '베이직';
                    planLevel = 1;
                    planId = 'basic';
                }

                if (planLevel > 0) {
                    const now = new Date();
                    const endDate = new Date(now);
                    endDate.setMonth(endDate.getMonth() + 1);

                    const subscriptionData = {
                        planName,
                        planLevel,
                        status: 'active',
                        startDate: admin.firestore.Timestamp.fromDate(now),
                        endDate: admin.firestore.Timestamp.fromDate(endDate),
                        amount,
                        orderId: resultMap.P_OID,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    };

                    // users 컬렉션의 subscription 필드 업데이트
                    await adminDb.collection('users').doc(userId).set(
                        { subscription: subscriptionData },
                        { merge: true }
                    );

                    // user_plans 컬렉션에도 저장 (Dashboard에서 참조)
                    await adminDb.collection('user_plans').doc(userId).set({
                        plan: planId,
                        expiryDate: endDate.toISOString(),
                        isActive: true,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    }, { merge: true });

                    console.log(`모바일: 사용자 ${userId}의 구독 정보 업데이트 완료: ${planName} (${planId})`);
                }
            } else {
                console.warn('주문번호에서 userId를 추출할 수 없습니다:', resultMap.P_OID);
            }
        } catch (firestoreError) {
            console.error('Firestore 저장 실패:', firestoreError);
        }

        return createRedirectResponse(
            `${BASE_URL}/checkout/complete?oid=${resultMap.P_OID}&price=${resultMap.P_AMT}`
        );

    } catch (error: any) {
        console.error("모바일 결제 콜백 처리 오류:", error);
        return createRedirectResponse(
            `${BASE_URL}/checkout/fail?msg=${encodeURIComponent('서버 오류가 발생했습니다')}`
        );
    }
}
