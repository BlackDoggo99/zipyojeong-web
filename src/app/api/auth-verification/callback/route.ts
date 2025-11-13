import { NextRequest, NextResponse } from 'next/server';
import { SeedCrypto } from '@/lib/seed-crypto';

/**
 * 이니시스 통합 본인인증 콜백 및 결과조회 API
 * POST /api/auth-verification/callback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resultCode, resultMsg, authRequestUrl, txId, token } = body;

    console.log('본인인증 콜백 수신:', { resultCode, resultMsg, txId });

    // 인증 실패 시
    if (resultCode !== '0000') {
      return NextResponse.json({
        success: false,
        error: decodeURIComponent(resultMsg || '본인인증에 실패했습니다'),
        resultCode,
      });
    }

    // authRequestUrl이 이니시스 URL인지 검증 (보안)
    const validUrls = [
      'https://kssa.inicis.com',
      'https://fcsa.inicis.com',
    ];

    const isValidUrl = validUrls.some(url => authRequestUrl?.startsWith(url));
    if (!isValidUrl) {
      console.error('유효하지 않은 authRequestUrl:', authRequestUrl);
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 인증 요청 URL입니다',
      }, { status: 400 });
    }

    // 이니시스에 결과 조회 요청
    const mid = process.env.INICIS_MID || 'INIiasTest';

    const resultQueryData = {
      mid,
      txId,
    };

    console.log('결과 조회 요청:', { authRequestUrl, resultQueryData });

    const response = await fetch(authRequestUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultQueryData),
    });

    if (!response.ok) {
      throw new Error(`이니시스 API 오류: ${response.status}`);
    }

    const resultData = await response.json();
    console.log('결과 조회 응답:', resultData);

    // 결과 코드 확인
    if (resultData.resultCode !== '0000') {
      return NextResponse.json({
        success: false,
        error: decodeURIComponent(resultData.resultMsg || '본인인증 결과 조회에 실패했습니다'),
        resultCode: resultData.resultCode,
      });
    }

    // SEED 복호화
    const SEED_IV = 'SASKGINICIS00000';

    try {
      const userName = SeedCrypto.decrypt(resultData.userName, token, SEED_IV);
      const userPhone = SeedCrypto.decrypt(resultData.userPhone, token, SEED_IV);
      const userBirthday = SeedCrypto.decrypt(resultData.userBirthday, token, SEED_IV);
      const userCi = SeedCrypto.decrypt(resultData.userCi, token, SEED_IV);

      console.log('본인인증 성공:', { userName, userPhone: userPhone.substring(0, 3) + '****' + userPhone.substring(7) });

      // 복호화된 사용자 정보 반환
      return NextResponse.json({
        success: true,
        data: {
          name: userName,
          phone: userPhone,
          birthday: userBirthday,
          ci: userCi,
          resultCode: resultData.resultCode,
          resultMsg: resultData.resultMsg,
        },
      });
    } catch (decryptError) {
      console.error('복호화 오류:', decryptError);
      return NextResponse.json({
        success: false,
        error: '사용자 정보 복호화에 실패했습니다',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('본인인증 콜백 처리 오류:', error);
    return NextResponse.json({
      success: false,
      error: '본인인증 처리 중 오류가 발생했습니다',
    }, { status: 500 });
  }
}

/**
 * GET 요청 핸들러 (브라우저 리다이렉트용)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const resultCode = searchParams.get('resultCode');
  const resultMsg = searchParams.get('resultMsg');
  const authRequestUrl = searchParams.get('authRequestUrl');
  const txId = searchParams.get('txId');
  const token = searchParams.get('token');

  // 파라미터를 body로 변환하여 POST 핸들러 재사용
  const mockRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({
      resultCode,
      resultMsg,
      authRequestUrl,
      txId,
      token,
    }),
  });

  return POST(mockRequest);
}
