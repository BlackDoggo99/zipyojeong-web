import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Apple App Store 영수증 검증 URL
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

// 환경 변수에서 App Store Shared Secret 가져오기
const APP_STORE_SHARED_SECRET = process.env.APP_STORE_SHARED_SECRET || '';

// 상품 ID와 플랜 ID 매핑 (월간 + 연간)
const PRODUCT_TO_PLAN: Record<string, string> = {
  // 월간 구독
  'zipyojeong_starter_monthly': 'starter',
  'zipyojeong_basic_monthly': 'basic',
  'zipyojeong_standard_monthly': 'standard',
  'zipyojeong_pro_monthly': 'pro',
  // 연간 구독 (10% 할인)
  'zipyojeong_starter_yearly': 'starter',
  'zipyojeong_basic_yearly': 'basic',
  'zipyojeong_standard_yearly': 'standard',
  'zipyojeong_pro_yearly': 'pro',
};

// 연간 구독 상품 ID 목록
const YEARLY_PRODUCTS = new Set([
  'zipyojeong_starter_yearly',
  'zipyojeong_basic_yearly',
  'zipyojeong_standard_yearly',
  'zipyojeong_pro_yearly',
]);

// Apple 영수증 검증 응답 타입
interface AppleReceiptResponse {
  status: number;
  environment?: 'Sandbox' | 'Production';
  receipt?: {
    bundle_id: string;
    application_version: string;
    in_app: Array<{
      product_id: string;
      transaction_id: string;
      original_transaction_id: string;
      purchase_date_ms: string;
      expires_date_ms?: string;
      is_trial_period?: string;
      is_in_intro_offer_period?: string;
      cancellation_date_ms?: string;
    }>;
  };
  latest_receipt_info?: Array<{
    product_id: string;
    transaction_id: string;
    original_transaction_id: string;
    purchase_date_ms: string;
    expires_date_ms?: string;
    is_trial_period?: string;
    is_in_intro_offer_period?: string;
    cancellation_date_ms?: string;
  }>;
  pending_renewal_info?: Array<{
    product_id: string;
    auto_renew_status: string;
    auto_renew_product_id: string;
    expiration_intent?: string;
  }>;
}

/**
 * Apple App Store에 영수증 검증 요청
 */
async function verifyWithApple(
  receiptData: string,
  useSandbox: boolean = false
): Promise<AppleReceiptResponse> {
  const url = useSandbox ? APPLE_SANDBOX_URL : APPLE_PRODUCTION_URL;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'receipt-data': receiptData,
      'password': APP_STORE_SHARED_SECRET,
      'exclude-old-transactions': true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Apple verification failed: ${response.status}`);
  }

  return response.json();
}

/**
 * 최신 유효한 구독 정보 찾기
 */
function findLatestValidSubscription(
  latestReceiptInfo: AppleReceiptResponse['latest_receipt_info']
): AppleReceiptResponse['latest_receipt_info'][0] | null {
  if (!latestReceiptInfo || latestReceiptInfo.length === 0) {
    return null;
  }

  // 만료 시간 기준으로 정렬 (가장 최신 것이 먼저)
  const sorted = [...latestReceiptInfo].sort((a, b) => {
    const expiresA = parseInt(a.expires_date_ms || '0', 10);
    const expiresB = parseInt(b.expires_date_ms || '0', 10);
    return expiresB - expiresA;
  });

  // 취소되지 않은 가장 최신 구독 찾기
  for (const subscription of sorted) {
    if (!subscription.cancellation_date_ms) {
      return subscription;
    }
  }

  return sorted[0]; // 모두 취소됐으면 가장 최신 것 반환
}

/**
 * POST /api/ios-receipt/verify
 * iOS 앱에서 구매 후 영수증 검증 요청
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiptData, userId, productId, transactionId } = body;

    // 필수 파라미터 확인
    if (!receiptData || !userId) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    console.log('[iOS Receipt] 영수증 검증 시작:', { userId, productId, transactionId });

    // 1. 프로덕션 환경에서 먼저 검증 시도
    let appleResponse = await verifyWithApple(receiptData, false);

    // 2. 샌드박스 영수증인 경우 (status: 21007), 샌드박스로 재시도
    if (appleResponse.status === 21007) {
      console.log('[iOS Receipt] 샌드박스 영수증 감지, 샌드박스로 재시도');
      appleResponse = await verifyWithApple(receiptData, true);
    }

    // 3. 검증 실패 체크
    if (appleResponse.status !== 0) {
      console.error('[iOS Receipt] Apple 검증 실패:', appleResponse.status);
      return NextResponse.json(
        {
          success: false,
          error: `Apple 영수증 검증 실패: ${appleResponse.status}`,
          appleStatus: appleResponse.status,
        },
        { status: 400 }
      );
    }

    // 4. 최신 구독 정보 찾기
    const latestSubscription = findLatestValidSubscription(
      appleResponse.latest_receipt_info
    );

    if (!latestSubscription) {
      console.error('[iOS Receipt] 유효한 구독 정보 없음');
      return NextResponse.json(
        { success: false, error: '유효한 구독 정보가 없습니다.' },
        { status: 400 }
      );
    }

    // 5. 구독 상태 확인
    const now = Date.now();
    const expiresDate = parseInt(latestSubscription.expires_date_ms || '0', 10);
    const purchaseDate = parseInt(latestSubscription.purchase_date_ms, 10);
    const isExpired = expiresDate < now;
    const isCancelled = !!latestSubscription.cancellation_date_ms;

    // 6. 플랜 ID 변환
    const planId = PRODUCT_TO_PLAN[latestSubscription.product_id] || 'free';

    // 7. 자동 갱신 상태 확인
    const pendingRenewal = appleResponse.pending_renewal_info?.find(
      (info) => info.product_id === latestSubscription.product_id
    );
    const autoRenewStatus = pendingRenewal?.auto_renew_status === '1';

    // 8. 구독 상태 결정
    let subscriptionStatus: 'active' | 'expired' | 'cancelled' | 'grace_period';
    if (isCancelled) {
      subscriptionStatus = 'cancelled';
    } else if (isExpired) {
      // 유예 기간 체크 (만료 후 16일까지)
      const gracePeriodEnd = expiresDate + (16 * 24 * 60 * 60 * 1000);
      if (now < gracePeriodEnd && autoRenewStatus) {
        subscriptionStatus = 'grace_period';
      } else {
        subscriptionStatus = 'expired';
      }
    } else {
      subscriptionStatus = 'active';
    }

    console.log('[iOS Receipt] 구독 상태:', {
      planId,
      status: subscriptionStatus,
      expiresDate: new Date(expiresDate).toISOString(),
      autoRenew: autoRenewStatus,
    });

    // 9. Firestore에 구독 정보 저장
    const isYearlySubscription = YEARLY_PRODUCTS.has(latestSubscription.product_id);
    const subscriptionData = {
      userId,
      planId,
      status: subscriptionStatus,
      platform: 'ios',
      productId: latestSubscription.product_id,
      transactionId: latestSubscription.transaction_id,
      originalTransactionId: latestSubscription.original_transaction_id,
      purchaseDate: Timestamp.fromMillis(purchaseDate),
      expiresDate: Timestamp.fromMillis(expiresDate),
      autoRenew: autoRenewStatus,
      billingPeriod: isYearlySubscription ? 'yearly' : 'monthly', // 결제 주기
      environment: appleResponse.environment || 'Production',
      isTrial: latestSubscription.is_trial_period === 'true',
      isIntroOffer: latestSubscription.is_in_intro_offer_period === 'true',
      lastVerifiedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // subscriptions 컬렉션에 저장
    await adminDb.collection('subscriptions').doc(userId).set(
      subscriptionData,
      { merge: true }
    );

    // users 컬렉션에도 플랜 정보 업데이트
    await adminDb.collection('users').doc(userId).set(
      {
        planId: subscriptionStatus === 'active' || subscriptionStatus === 'grace_period' ? planId : 'free',
        subscriptionStatus,
        subscriptionPlatform: 'ios',
        subscriptionExpiresAt: Timestamp.fromMillis(expiresDate),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    // 10. 영수증 검증 로그 저장
    await adminDb.collection('receipt_verifications').add({
      userId,
      transactionId: latestSubscription.transaction_id,
      productId: latestSubscription.product_id,
      status: subscriptionStatus,
      environment: appleResponse.environment,
      verifiedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      subscription: {
        planId,
        status: subscriptionStatus,
        expiresDate: new Date(expiresDate).toISOString(),
        autoRenew: autoRenewStatus,
        isTrial: latestSubscription.is_trial_period === 'true',
      },
    });
  } catch (error) {
    console.error('[iOS Receipt] 영수증 검증 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '영수증 검증 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ios-receipt/verify
 * 특정 사용자의 구독 상태 확인 (앱 시작 시 호출)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }

    // Firestore에서 구독 정보 조회
    const subscriptionDoc = await adminDb.collection('subscriptions').doc(userId).get();

    if (!subscriptionDoc.exists) {
      return NextResponse.json({
        success: true,
        subscription: null,
        message: '구독 정보가 없습니다.',
      });
    }

    const subscriptionData = subscriptionDoc.data();

    // iOS 구독이 아닌 경우
    if (subscriptionData?.platform !== 'ios') {
      return NextResponse.json({
        success: true,
        subscription: null,
        message: 'iOS 구독이 아닙니다.',
      });
    }

    // 만료 여부 확인
    const expiresDate = subscriptionData.expiresDate?.toMillis() || 0;
    const now = Date.now();
    const isExpired = expiresDate < now;

    // 만료된 경우 상태 업데이트
    if (isExpired && subscriptionData.status === 'active') {
      await adminDb.collection('subscriptions').doc(userId).update({
        status: 'expired',
        updatedAt: Timestamp.now(),
      });

      await adminDb.collection('users').doc(userId).update({
        planId: 'free',
        subscriptionStatus: 'expired',
        updatedAt: Timestamp.now(),
      });

      subscriptionData.status = 'expired';
    }

    return NextResponse.json({
      success: true,
      subscription: {
        planId: subscriptionData.planId,
        status: subscriptionData.status,
        expiresDate: subscriptionData.expiresDate?.toDate().toISOString(),
        autoRenew: subscriptionData.autoRenew,
        isTrial: subscriptionData.isTrial,
      },
    });
  } catch (error) {
    console.error('[iOS Receipt] 구독 상태 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '구독 상태 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
