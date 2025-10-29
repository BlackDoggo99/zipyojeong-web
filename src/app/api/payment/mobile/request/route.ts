import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// KG이니시스 모바일 설정
const P_MID = "INIpayTest";
const HASH_KEY = "3CB8183A4BE283555ACC8363C0360223";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, planName } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, msg: "유효하지 않은 금액입니다." },
                { status: 400 }
            );
        }

        // 모바일 결제 파라미터 생성
        const P_OID = `ZIPM_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
        const P_AMT = amount.toString();
        const P_TIMESTAMP = new Date().getTime().toString();

        // SHA512 Hash 생성: BASE64_ENCODE(SHA512(P_AMT+P_OID+P_TIMESTAMP+HashKey))
        const hashData = P_AMT + P_OID + P_TIMESTAMP + HASH_KEY;
        const P_CHKFAKE = crypto.createHash('sha512')
            .update(hashData, 'utf8')
            .digest('base64');

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
