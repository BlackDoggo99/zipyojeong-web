import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// KG이니시스 모바일 설정
const P_MID = "INIpayTest";
const HASH_KEY = "3CB8183A4BE283555ACC8363C0360223";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, planName, userId } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, msg: "유효하지 않은 금액입니다." },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, msg: "사용자 정보가 필요합니다." },
                { status: 400 }
            );
        }

        // userId를 짧게 해시 (MD5의 처음 10자)
        const userIdHash = crypto.createHash('md5').update(userId).digest('hex').substring(0, 10);
        const P_OID = `ZIPM_${userIdHash}_${new Date().getTime()}`;
        const P_AMT = amount.toString();
        const P_TIMESTAMP = new Date().getTime().toString();

        // SHA512 Hash 생성: BASE64_ENCODE(SHA512(P_AMT+P_OID+P_TIMESTAMP+HashKey))
        const hashData = P_AMT + P_OID + P_TIMESTAMP + HASH_KEY;
        const P_CHKFAKE = crypto.createHash('sha512')
            .update(hashData, 'utf8')
            .digest('base64');

        // Firestore에 주문번호 매핑 저장 (callback에서 userId 추출용)
        try {
            const { adminDb } = await import('@/lib/firebase-admin');
            const admin = (await import('firebase-admin')).default;

            await adminDb.collection('orderMappings').doc(P_OID).set({
                userId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`모바일 주문번호 매핑 저장: ${P_OID} -> ${userId}`);
        } catch (error) {
            console.error('주문번호 매핑 저장 실패:', error);
        }

        return NextResponse.json({
            success: true,
            P_MID,
            P_OID,
            P_AMT,
            P_TIMESTAMP,
            P_CHKFAKE,
            P_GOODS: planName
        });
    } catch (error: any) {
        console.error("모바일 결제 파라미터 생성 오류:", error);
        return NextResponse.json(
            { success: false, msg: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
