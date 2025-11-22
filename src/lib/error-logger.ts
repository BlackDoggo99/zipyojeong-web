/**
 * 에러 로깅 유틸리티
 *
 * Firebase Analytics 또는 콘솔에 에러를 기록합니다.
 */

interface ErrorLogData {
  errorCode?: string;
  errorMessage: string;
  userId?: string;
  timestamp: string;
  context?: Record<string, any>;
}

/**
 * 에러 로깅 (개발 환경: 콘솔, 운영 환경: Firebase Analytics)
 * @param category - 에러 카테고리 (auth, payment, verification 등)
 * @param error - 에러 객체 또는 메시지
 * @param context - 추가 컨텍스트 정보
 */
export function logError(
  category: string,
  error: Error | string,
  context?: Record<string, any>
): void {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorCode = typeof error === 'object' && 'code' in error ? (error as any).code : undefined;

  const logData: ErrorLogData = {
    errorCode,
    errorMessage,
    timestamp: new Date().toISOString(),
    context,
  };

  // 개발 환경: 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${category.toUpperCase()} ERROR]`, logData);
  }

  // 운영 환경: Firebase Analytics 또는 외부 서비스로 전송
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    try {
      // Firebase Analytics가 초기화되어 있다면 이벤트 전송
      if ((window as any).gtag) {
        (window as any).gtag('event', 'error', {
          event_category: category,
          event_label: errorMessage,
          error_code: errorCode,
          value: context ? JSON.stringify(context) : undefined,
        });
      }

      // 또는 Sentry, LogRocket 등 다른 서비스 사용 가능
      // Example: Sentry.captureException(error, { tags: { category }, extra: context });

    } catch (logError) {
      console.warn('에러 로깅 실패:', logError);
    }
  }
}

/**
 * 이니시스 본인인증 에러 로깅
 */
export function logInicisAuthError(
  error: Error | string,
  context?: Record<string, any>
): void {
  logError('inicis_auth', error, context);
}

/**
 * Firestore 저장 에러 로깅
 */
export function logFirestoreError(
  error: Error | string,
  context?: Record<string, any>
): void {
  logError('firestore', error, context);
}

/**
 * API 호출 에러 로깅
 */
export function logApiError(
  apiPath: string,
  error: Error | string,
  context?: Record<string, any>
): void {
  logError('api', error, {
    ...context,
    apiPath,
  });
}

/**
 * 성공 이벤트 로깅 (선택적)
 */
export function logSuccess(
  category: string,
  message: string,
  context?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    try {
      if ((window as any).gtag) {
        (window as any).gtag('event', 'success', {
          event_category: category,
          event_label: message,
          value: context ? JSON.stringify(context) : undefined,
        });
      }
    } catch (logError) {
      console.warn('성공 로깅 실패:', logError);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[${category.toUpperCase()} SUCCESS]`, message, context);
  }
}
