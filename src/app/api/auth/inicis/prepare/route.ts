import { NextRequest, NextResponse } from 'next/server';
import { generateAuthHash, generateMTxId } from '@/lib/inicis-crypto';

/**
 * KG이니시스 본인인증 준비 API
 *
 * 클라이언트에서 호출하여 본인인증에 필요한 파라미터를 생성합니다.
 * authHash는 서버사이드에서만 생성되어야 합니다 (API Key 노출 방지).
 */
export async function POST(request: NextRequest) {
  try {
    const mid = process.env.INICIS_AUTH_MID;
    const apiKey = process.env.INICIS_AUTH_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // 환경변수 검증
    if (!mid || !apiKey || !appUrl) {
      console.error('이니시스 환경변수 누락:', { mid: !!mid, apiKey: !!apiKey, appUrl: !!appUrl });
      return NextResponse.json(
        { success: false, error: '서버 설정 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 트랜잭션 ID 생성 (20 byte)
    const mTxId = generateMTxId();

    // authHash 생성 (SHA256)
    const authHash = generateAuthHash(mid, mTxId, apiKey);

    // 본인인증 요청 파라미터
    const authParams = {
      mid,                                              // 상점ID
      reqSvcCd: '03',                                   // 본인확인 서비스 코드
      mTxId,                                            // 트랜잭션 ID
      authHash,                                         // SHA256 해시
      flgFixedUser: 'N',                                // 사용자 지정구분 코드 (N: 일반)
      providerDevCd: 'TOSS,KFTC,SHINHAN,KB,WOORI,KAKAOBANK',  // 제휴사코드 (본인확인 지원, SMS 제외)
      successUrl: `${appUrl}/api/auth/inicis/callback/success`,  // 성공 URL
      failUrl: `${appUrl}/api/auth/inicis/callback/fail`,        // 실패 URL
      reservedMsg: 'isUseToken=Y',                      // 암호화 응답 요청
    };

    console.log('[이니시스] 본인인증 준비 완료:', {
      mTxId,
      mid,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      authParams,
      mTxId, // 클라이언트에서 추적용
    });

  } catch (error) {
    console.error('[이니시스] 본인인증 준비 실패:', error);
    return NextResponse.json(
      { success: false, error: '본인인증 준비 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
