'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * 이니시스 본인인증 결과 처리 컴포넌트
 */
function AuthVerificationResultContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('본인인증 결과를 처리하고 있습니다...');

  useEffect(() => {
    const processVerification = async () => {
      try {
        // URL 파라미터에서 인증 결과 가져오기
        const resultCode = searchParams.get('resultCode');
        const resultMsg = searchParams.get('resultMsg');
        const authRequestUrl = searchParams.get('authRequestUrl');
        const txId = searchParams.get('txId');
        const token = searchParams.get('token');

        console.log('본인인증 결과 수신:', { resultCode, txId });

        // 서버에 결과 조회 요청
        const response = await fetch('/api/auth-verification/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resultCode,
            resultMsg,
            authRequestUrl,
            txId,
            token,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // 성공 시 부모 창에 결과 전송
          setStatus('success');
          setMessage('본인인증이 완료되었습니다.');

          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'AUTH_VERIFICATION_RESULT',
                payload: result,
              },
              window.location.origin
            );

            // 2초 후 창 닫기
            setTimeout(() => {
              window.close();
            }, 2000);
          }
        } else {
          // 실패 시
          setStatus('error');
          setMessage(result.error || '본인인증에 실패했습니다.');

          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'AUTH_VERIFICATION_RESULT',
                payload: result,
              },
              window.location.origin
            );

            // 3초 후 창 닫기
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        }
      } catch (error) {
        console.error('본인인증 처리 오류:', error);
        setStatus('error');
        setMessage('본인인증 처리 중 오류가 발생했습니다.');

        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'AUTH_VERIFICATION_RESULT',
              payload: {
                success: false,
                error: '본인인증 처리 중 오류가 발생했습니다.',
              },
            },
            window.location.origin
          );

          setTimeout(() => {
            window.close();
          }, 3000);
        }
      }
    };

    processVerification();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">본인인증 처리 중</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-700 mb-2">본인인증 완료</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">잠시 후 창이 자동으로 닫힙니다.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">본인인증 실패</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">잠시 후 창이 자동으로 닫힙니다.</p>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * 이니시스 본인인증 결과 처리 페이지
 * 팝업 창에서 로드되며, 부모 창(회원가입 페이지)에 결과를 전송합니다.
 */
export default function AuthVerificationResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold mb-2">본인인증 처리 중</h2>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    }>
      <AuthVerificationResultContent />
    </Suspense>
  );
}
