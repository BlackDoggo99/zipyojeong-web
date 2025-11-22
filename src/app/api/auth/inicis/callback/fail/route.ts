import { NextRequest, NextResponse } from 'next/server';

/**
 * KG이니시스 본인인증 실패 콜백 API
 *
 * 이니시스 서버에서 POST로 전송되는 인증 실패 결과를 처리합니다.
 * 팝업 창을 닫으면서 부모 창에 실패 정보를 전달합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    // Form 데이터 파싱
    const formData = await request.formData();
    const resultCode = formData.get('resultCode') as string;
    const resultMsg = formData.get('resultMsg') as string;
    const mTxId = formData.get('mTxId') as string;

    console.log('[이니시스] 실패 콜백 수신:', {
      resultCode,
      resultMsg,
      mTxId,
      timestamp: new Date().toISOString(),
    });

    // 실패 응답 HTML (팝업 닫기 + 부모 창에 메시지 전달)
    return new NextResponse(
      generatePopupCloseHTML({
        code: resultCode || 'UNKNOWN_ERROR',
        message: resultMsg || '본인인증에 실패했습니다.',
        mTxId,
      }, appUrl),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );

  } catch (error) {
    console.error('[이니시스] 실패 콜백 처리 실패:', error);
    return new NextResponse(
      generatePopupCloseHTML({
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.',
      }, process.env.NEXT_PUBLIC_APP_URL!),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

/**
 * 팝업 닫기 + 부모 창에 실패 메시지 전달 HTML 생성
 */
function generatePopupCloseHTML(error: { code: string; message: string; mTxId?: string }, appUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>본인인증 실패</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
        }
        .message {
          text-align: center;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .error-icon {
          font-size: 48px;
          color: #dc2626;
          margin-bottom: 16px;
        }
        .error-message {
          color: #374151;
          font-size: 16px;
          margin-bottom: 8px;
        }
        .error-code {
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="message">
        <div class="error-icon">⚠️</div>
        <div class="error-message">본인인증에 실패했습니다</div>
        <div class="error-code">오류 코드: ${error.code}</div>
      </div>
      <script>
        try {
          if (window.opener) {
            window.opener.postMessage({
              type: 'INICIS_AUTH_FAIL',
              error: ${JSON.stringify(error)}
            }, '${appUrl}');
          }

          // 2초 후 자동으로 창 닫기
          setTimeout(() => {
            window.close();
          }, 2000);

        } catch (error) {
          console.error('메시지 전달 실패:', error);
          alert('본인인증 처리 중 오류가 발생했습니다.');
          window.close();
        }
      </script>
    </body>
    </html>
  `;
}
