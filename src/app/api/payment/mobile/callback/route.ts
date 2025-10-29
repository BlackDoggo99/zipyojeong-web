import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zipyojeong.vercel.app";

// properties 함수
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

        console.log("모바일 결제 콜백 수신:", body);

        // 1. 인증 결과 확인
        if (body.P_STATUS !== "00") {
            console.error("모바일 인증 실패:", body);
            return NextResponse.redirect(
                `${BASE_URL}/checkout/fail?msg=${encodeURIComponent(body.P_RMESG1 || '결제 인증 실패')}`
            );
        }

        // 2. 최종 승인 요청 파라미터 준비
        const P_TID = body.P_TID;
        const P_MID = P_TID.substring(10, 20); // TID에서 MID 추출

        const idc_name = body.idc_name;
        const P_REQ_URL = body.P_REQ_URL;
        const P_REQ_URL2 = getAuthUrl(idc_name);

        // 3. URL 검증
        if (P_REQ_URL !== P_REQ_URL2) {
            console.error("승인 URL 불일치:", { P_REQ_URL, P_REQ_URL2 });
            return NextResponse.redirect(
                `${BASE_URL}/checkout/fail?msg=인증 URL 불일치 오류`
            );
        }

        // 4. 최종 승인 요청
        const approvalParams = new URLSearchParams({
            P_MID: P_MID,
            P_TID: P_TID
        });

        const approvalResponse = await fetch(P_REQ_URL2, {
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

            return NextResponse.redirect(
                `${BASE_URL}/checkout/fail?msg=${encodeURIComponent(resultMap.P_RMESG1 || '결제 승인 실패')}`
            );
        }

        // 7. 결제 성공
        console.log("모바일 결제 성공:", resultMap);

        // TODO: Firestore에 결제 정보 저장
        // await db.collection('payments').doc(resultMap.P_OID).set({...});

        return NextResponse.redirect(
            `${BASE_URL}/checkout/complete?oid=${resultMap.P_OID}&price=${resultMap.P_AMT}`
        );

    } catch (error: any) {
        console.error("모바일 결제 콜백 처리 오류:", error);
        return NextResponse.redirect(
            `${BASE_URL}/checkout/fail?msg=${encodeURIComponent('서버 오류가 발생했습니다')}`
        );
    }
}
