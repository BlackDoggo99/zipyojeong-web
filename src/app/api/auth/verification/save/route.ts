import { NextRequest, NextResponse } from 'next/server';
import {
  saveUserVerification,
  checkDuplicateVerification
} from '@/lib/firestore-verification';

/**
 * 본인인증 결과를 Firestore에 저장하는 API
 *
 * 클라이언트에서 본인인증 성공 후 호출합니다.
 * DI/CI 중복 체크 후 저장합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      userName,
      userPhone,
      userBirthday,
      userGender,
      isForeign,
      userDi,
      userCi,
      mTxId
    } = body;

    // 필수 파라미터 검증
    if (!userId || !userName || !userPhone || !userDi || !userCi) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    console.log('[인증 저장] 요청:', {
      userId,
      userName,
      mTxId,
      timestamp: new Date().toISOString(),
    });

    // DI/CI 중복 확인
    const { isDuplicate, existingUser } = await checkDuplicateVerification(userDi, userCi);

    if (isDuplicate && existingUser) {
      // 이미 다른 계정으로 인증된 경우
      if (existingUser.userId !== userId) {
        console.warn('[인증 저장] 중복 인증 감지:', {
          newUserId: userId,
          existingUserId: existingUser.userId,
          existingUserName: existingUser.userName,
        });

        return NextResponse.json({
          success: false,
          error: 'DUPLICATE_VERIFICATION',
          message: '이미 다른 계정에서 인증된 정보입니다.',
          existingUser: {
            userId: existingUser.userId,
            userName: existingUser.userName,
            verifiedAt: existingUser.verifiedAt,
          },
        }, { status: 409 }); // 409 Conflict
      }

      // 같은 사용자가 재인증하는 경우 - 업데이트 허용
      console.log('[인증 저장] 기존 사용자 재인증 - 업데이트 진행');
    }

    // Firestore에 저장
    await saveUserVerification(userId, {
      userName,
      userPhone,
      userBirthday,
      userGender: userGender as 'M' | 'F',
      isForeign: isForeign as '0' | '1',
      userDi,
      userCi,
      mTxId,
    });

    console.log('[인증 저장] 성공:', { userId, mTxId });

    return NextResponse.json({
      success: true,
      message: '본인인증 정보가 저장되었습니다.',
      data: {
        userId,
        userName,
        isUpdate: isDuplicate && existingUser?.userId === userId,
      },
    });

  } catch (error) {
    console.error('[인증 저장] 실패:', error);

    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: '본인인증 정보 저장 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}
