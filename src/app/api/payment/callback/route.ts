import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SIGN_KEY = "SU5JTElURV9UUklQTEVERVNfS0VZU1RS";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zipyojeong.vercel.app";

// properties 함수들
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
            return "https://stg" + url;
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
            return "https://stg" + url;
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
            return NextResponse.redirect(
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

        // 4. authUrl 검증
        if (authUrl !== authUrl2) {
            console.error("authUrl 불일치:", { authUrl, authUrl2 });
            return NextResponse.redirect(
                `${BASE_URL}/checkout/fail?msg=인증 URL 불일치 오류`
            );
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

            return NextResponse.redirect(
                `${BASE_URL}/checkout/fail?msg=${encodeURIComponent(result?.resultMsg || '네트워크 오류')}`
            );
        }

        // 6. 최종 결제 성공
        console.log("결제 성공:", result);

        // TODO: Firestore에 결제 정보 저장
        // 예시:
        // await db.collection('payments').doc(result.MOID).set({
        //     tid: result.tid,
        //     orderId: result.MOID,
        //     amount: parseInt(result.TotPrice),
        //     status: 'completed',
        //     timestamp: new Date(),
        // });

        return NextResponse.redirect(
            `${BASE_URL}/checkout/complete?oid=${result.MOID}&price=${result.TotPrice}`
        );

    } catch (error: any) {
        console.error("결제 콜백 처리 오류:", error);
        return NextResponse.redirect(
            `${BASE_URL}/checkout/fail?msg=${encodeURIComponent('서버 오류가 발생했습니다')}`
        );
    }
}
