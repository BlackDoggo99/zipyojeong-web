'use client';

import { useState } from 'react';
import { logInicisAuthError, logSuccess } from '@/lib/error-logger';

interface InicisAuthResult {
  userName: string;
  userPhone: string;
  userBirthday: string;
  userGender: 'M' | 'F';
  isForeign: '0' | '1';
  userDi: string;
  userCi: string;
  mTxId: string;
}

interface InicisAuthButtonProps {
  /** 본인인증 성공 시 콜백 */
  onSuccess?: (result: InicisAuthResult) => void;
  /** 본인인증 실패 시 콜백 */
  onFail?: (error: { code: string; message: string }) => void;
  /** Firebase Auth UID (Firestore 자동 저장 시 필요) */
  userId?: string;
  /** Firestore 자동 저장 여부 (기본값: true) */
  autoSaveToFirestore?: boolean;
  /** 버튼 스타일 클래스 */
  className?: string;
  /** 버튼 내용 */
  children?: React.ReactNode;
}

/**
 * iOS/iPad 기기 감지
 */
function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return /ipad|iphone|ipod/.test(userAgent) ||
    (userAgent.includes('macintosh') && navigator.maxTouchPoints > 1); // iPad Pro 감지
}

/**
 * KG이니시스 본인인증 버튼 컴포넌트
 *
 * 사용 예시:
 * ```tsx
 * <InicisAuthButton
 *   onSuccess={(result) => console.log('인증 성공:', result)}
 *   onFail={(error) => console.error('인증 실패:', error)}
 * />
 * ```
 */
export default function InicisAuthButton({
  onSuccess,
  onFail,
  userId,
  autoSaveToFirestore = true,
  className = '',
  children,
}: InicisAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Firestore에 본인인증 정보 저장
   */
  const saveToFirestore = async (authData: InicisAuthResult) => {
    try {
      console.log('[Firestore] 본인인증 정보 저장 시작...');

      const response = await fetch('/api/auth/verification/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...authData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'DUPLICATE_VERIFICATION') {
          console.error('[Firestore] 중복 인증:', result.message);
          alert(`⚠️ ${result.message}\n이미 인증된 계정: ${result.existingUser.userName}`);
        } else {
          throw new Error(result.message || '저장 실패');
        }
        return;
      }

      console.log('[Firestore] 본인인증 정보 저장 완료:', result);
      logSuccess('inicis_verification', '본인인증 정보 저장 완료', { userId });
    } catch (error) {
      console.error('[Firestore] 저장 실패:', error);
      logInicisAuthError(error as Error, { action: 'save_to_firestore', userId });
      // 저장 실패해도 사용자에게는 알리지 않음 (인증은 성공했으므로)
    }
  };

  const handleAuth = async () => {
    try {
      setIsLoading(true);

      // 1. 서버에서 인증 파라미터 준비
      const prepareRes = await fetch('/api/auth/inicis/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!prepareRes.ok) {
        throw new Error('본인인증 준비 실패');
      }

      const { authParams } = await prepareRes.json();

      console.log('[이니시스] 인증 시작:', { mTxId: authParams.mTxId });

      // iOS/iPad에서는 팝업 대신 현재 창에서 Form 제출 (redirect 방식)
      if (isIOSDevice()) {
        console.log('[이니시스] iOS 감지 - redirect 방식 사용');

        // 현재 페이지 URL을 세션 스토리지에 저장 (인증 후 복귀용)
        sessionStorage.setItem('inicis_return_url', window.location.href);

        // 현재 창에서 Form 생성 및 제출
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://sa.inicis.com/id/auth';

        Object.entries(authParams).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return; // 페이지 이동하므로 여기서 종료
      }

      // PC/Android: 기존 팝업 방식 유지
      // 2. 팝업 열기 (400x640)
      const popup = window.open(
        '',
        'InicisAuth',
        'width=400,height=640,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        setIsLoading(false);
        return;
      }

      // 3. 팝업에 Form 생성 및 제출
      const form = popup.document.createElement('form');
      form.method = 'POST';
      form.action = 'https://sa.inicis.com/id/auth';

      // 파라미터 추가
      Object.entries(authParams).forEach(([key, value]) => {
        const input = popup.document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      popup.document.body.appendChild(form);
      form.submit();

      // 4. 콜백 메시지 수신 대기
      const handleMessage = (event: MessageEvent) => {
        // 보안: origin 검증
        if (event.origin !== window.location.origin) {
          console.warn('[이니시스] 잘못된 origin:', event.origin);
          return;
        }

        // 성공 처리
        if (event.data.type === 'INICIS_AUTH_SUCCESS') {
          console.log('[이니시스] 본인인증 성공:', event.data.data);

          // Firestore 자동 저장
          if (autoSaveToFirestore && userId) {
            saveToFirestore(event.data.data);
          } else if (autoSaveToFirestore && !userId) {
            console.warn('[이니시스] userId가 없어 Firestore 저장을 건너뜁니다.');
          }

          if (onSuccess) {
            onSuccess(event.data.data);
          } else {
            alert(`본인인증 성공!\\n이름: ${event.data.data.userName}\\n전화번호: ${event.data.data.userPhone}`);
          }

          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
        }
        // 실패 처리
        else if (event.data.type === 'INICIS_AUTH_FAIL') {
          console.error('[이니시스] 본인인증 실패:', event.data.error);

          if (onFail) {
            onFail(event.data.error);
          } else {
            alert(`본인인증 실패\\n오류: ${event.data.error.message} (${event.data.error.code})`);
          }

          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
        }
      };

      window.addEventListener('message', handleMessage);

      // 5. 팝업이 닫히면 로딩 해제 (타임아웃)
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
          console.log('[이니시스] 팝업 닫힘');
        }
      }, 1000);

    } catch (error) {
      console.error('[이니시스] 본인인증 오류:', error);
      logInicisAuthError(error as Error, { action: 'inicis_auth_request', userId });
      alert('본인인증 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={isLoading}
      className={
        className ||
        'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
      }
    >
      {children || (isLoading ? '본인인증 진행 중...' : '본인인증')}
    </button>
  );
}
