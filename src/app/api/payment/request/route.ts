import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// KG이니시스 설정
const MID = "INIpayTest";
const SIGN_KEY = "SU5JTElURV9UUklQTEVERVNfS0VZU1RS";

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

        const mid = MID;
        const signKey = SIGN_KEY;
        const mKey = crypto.createHash("sha256").update(signKey).digest('hex');
        const oid = `ZIP_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
        const price = amount.toString();
        const timestamp = new Date().getTime();
        const use_chkfake = "Y";

        const signature = crypto.createHash("sha256").update("oid="+oid+"&price="+price+"&timestamp="+timestamp).digest('hex');
        const verification = crypto.createHash("sha256").update("oid="+oid+"&price="+price+"&signKey="+signKey+"&timestamp="+timestamp).digest('hex');

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
