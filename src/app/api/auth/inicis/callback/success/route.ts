import { NextRequest, NextResponse } from 'next/server';
import { aesDecrypt, formatPhoneNumber, formatBirthday } from '@/lib/inicis-crypto';

/**
 * KG이니시스 본인인증 성공 콜백 API
 *
 * 이니시스 서버에서 POST로 전송되는 인증 결과를 처리합니다.
 * 암호화된 데이터를 복호화하고, 팝업 창을 닫으면서 부모 창에 결과를 전달합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.INICIS_AUTH_API_KEY!;
    const seedIV = process.env.INICIS_AUTH_SEED_IV!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    // Form 데이터 파싱
    const formData = await request.formData();
    const resultCode = formData.get('resultCode') as string;
    const resultMsg = formData.get('resultMsg') as string;
    const mTxId = formData.get('mTxId') as string;

    console.log('[이니시스] 성공 콜백 수신:', {
      resultCode,
      resultMsg,
      mTxId,
      timestamp: new Date().toISOString(),
    });

    // resultCode가 0000이 아니면 실제로는 실패
    if (resultCode !== '0000') {
      console.warn('[이니시스] 성공 URL로 왔지만 resultCode가 0000이 아님:', resultCode);
      return new NextResponse(
        generatePopupCloseHTML('INICIS_AUTH_FAIL', {
          code: resultCode,
          message: resultMsg || '본인인증에 실패했습니다.',
        }, appUrl),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // 암호화된 데이터 복호화 (reservedMsg='isUseToken=Y'인 경우)
    const encryptedData = {
      userName: formData.get('userName') as string,
      userPhone: formData.get('userPhone') as string,
      userBirthday: formData.get('userBirthday') as string,
      userGender: formData.get('userGender') as string,
      isForeign: formData.get('isForeign') as string,
    };

    // DI, CI는 암호화되지 않음
    const userDi = formData.get('userDi') as string;
    const userCi2 = formData.get('userCi2') as string;

    let decryptedData;

    try {
      // 데이터 복호화
      decryptedData = {
        userName: aesDecrypt(encryptedData.userName, apiKey, seedIV),
        userPhone: formatPhoneNumber(aesDecrypt(encryptedData.userPhone, apiKey, seedIV)),
        userBirthday: formatBirthday(aesDecrypt(encryptedData.userBirthday, apiKey, seedIV)),
        userGender: aesDecrypt(encryptedData.userGender, apiKey, seedIV),
        isForeign: aesDecrypt(encryptedData.isForeign, apiKey, seedIV),
        userDi,
        userCi: userCi2,
        mTxId,
      };

      console.log('[이니시스] 복호화 성공:', {
        userName: decryptedData.userName,
        userPhone: decryptedData.userPhone,
        mTxId,
      });

    } catch (decryptError) {
      console.error('[이니시스] 복호화 실패:', decryptError);
      return new NextResponse(
        generatePopupCloseHTML('INICIS_AUTH_FAIL', {
          code: 'DECRYPT_ERROR',
          message: '인증 데이터 처리 중 오류가 발생했습니다.',
        }, appUrl),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // 성공 응답 HTML (팝업 닫기 + 부모 창에 메시지 전달)
    return new NextResponse(
      generatePopupCloseHTML('INICIS_AUTH_SUCCESS', decryptedData, appUrl),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );

  } catch (error) {
    console.error('[이니시스] 성공 콜백 처리 실패:', error);
    return new NextResponse(
      generatePopupCloseHTML('INICIS_AUTH_FAIL', {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.',
      }, process.env.NEXT_PUBLIC_APP_URL!),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

/**
 * 팝업 닫기 + 부모 창에 메시지 전달 HTML 생성
 */
function generatePopupCloseHTML(type: string, data: any, appUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>본인인증 ${type === 'INICIS_AUTH_SUCCESS' ? '성공' : '실패'}</title>
    </head>
    <body>
      <script>
        try {
          if (window.opener) {
            window.opener.postMessage({
              type: '${type}',
              data: ${JSON.stringify(data)}
            }, '${appUrl}');
          }
          window.close();
        } catch (error) {
          console.error('메시지 전달 실패:', error);
          alert('본인인증 처리 중 오류가 발생했습니다.');
          window.close();
        }
      </script>
      <p style="text-align: center; margin-top: 50px; font-family: sans-serif;">
        창을 닫는 중입니다...
      </p>
    </body>
    </html>
  `;
}
