import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// KG이니시스 설정 - 환경 변수에서 가져오기
const MID = process.env.INICIS_MID || "INIpayTest";
const SIGN_KEY = process.env.INICIS_SIGN_KEY || "SU5JTElURV9UUklQTEVERVNfS0VZU1RS";

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

        const mid = MID;
        const signKey = SIGN_KEY;
        const mKey = crypto.createHash("sha256").update(signKey).digest('hex');

        console.log("결제 요청 파라미터:", {
            mid,
            hasMID: !!process.env.INICIS_MID,
            hasSignKey: !!process.env.INICIS_SIGN_KEY
        });

        // userId를 짧게 해시 (MD5의 처음 10자)
        const userIdHash = crypto.createHash('md5').update(userId).digest('hex').substring(0, 10);
        const oid = `ZIP_${userIdHash}_${new Date().getTime()}`;

        const price = amount.toString();
        const timestamp = new Date().getTime();
        const use_chkfake = "Y";

        const signature = crypto.createHash("sha256").update("oid="+oid+"&price="+price+"&timestamp="+timestamp).digest('hex');
        const verification = crypto.createHash("sha256").update("oid="+oid+"&price="+price+"&signKey="+signKey+"&timestamp="+timestamp).digest('hex');

        // Firestore에 주문번호 매핑 저장 (callback에서 userId 추출용)
        try {
            const { adminDb } = await import('@/lib/firebase-admin');
            const admin = (await import('firebase-admin')).default;

            await adminDb.collection('orderMappings').doc(oid).set({
                userId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`주문번호 매핑 저장: ${oid} -> ${userId}`);
        } catch (error) {
            console.error('주문번호 매핑 저장 실패:', error);
            // 매핑 저장 실패해도 결제는 진행
        }

        return NextResponse.json({
            success: true,
            mid,
            oid,
            price,
            timestamp,
            mKey,
            use_chkfake,
            signature,
            verification,
            planName
        });
    } catch (error: any) {
        console.error("결제 파라미터 생성 오류:", error);
        return NextResponse.json(
            { success: false, msg: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
