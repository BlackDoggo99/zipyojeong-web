import { firestore } from './firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { UserVerification, UserVerificationCreate } from '@/types/user-verification';

/**
 * Firestore 본인인증 데이터 관리
 */

/**
 * 본인인증 정보를 Firestore에 저장
 * @param userId - Firebase Auth UID
 * @param verificationData - 본인인증 결과 데이터
 * @returns 저장 성공 여부
 */
export async function saveUserVerification(
  userId: string,
  verificationData: Omit<UserVerificationCreate, 'userId'>
): Promise<boolean> {
  try {
    const verificationDoc: UserVerification = {
      userId,
      ...verificationData,
      verifiedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(firestore, 'user_verifications', userId), verificationDoc);

    console.log('[Firestore] 본인인증 정보 저장 완료:', userId);
    return true;
  } catch (error) {
    console.error('[Firestore] 본인인증 정보 저장 실패:', error);
    throw error;
  }
}

/**
 * 사용자의 본인인증 정보 조회
 * @param userId - Firebase Auth UID
 * @returns 본인인증 정보 또는 null
 */
export async function getUserVerification(userId: string): Promise<UserVerification | null> {
  try {
    const docSnap = await getDoc(doc(firestore, 'user_verifications', userId));

    if (docSnap.exists()) {
      return docSnap.data() as UserVerification;
    }

    return null;
  } catch (error) {
    console.error('[Firestore] 본인인증 정보 조회 실패:', error);
    throw error;
  }
}

/**
 * DI로 중복 인증 확인
 * @param userDi - DI (Duplication Information)
 * @returns 중복 사용자 정보 또는 null
 */
export async function checkDuplicateByDI(userDi: string): Promise<UserVerification | null> {
  try {
    const q = query(
      collection(firestore, 'user_verifications'),
      where('userDi', '==', userDi)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const existingUser = querySnapshot.docs[0].data() as UserVerification;
      console.warn('[Firestore] DI 중복 발견:', {
        existingUserId: existingUser.userId,
        userName: existingUser.userName,
      });
      return existingUser;
    }

    return null;
  } catch (error) {
    console.error('[Firestore] DI 중복 확인 실패:', error);
    throw error;
  }
}

/**
 * CI로 중복 인증 확인
 * @param userCi - CI (Connection Information)
 * @returns 중복 사용자 정보 또는 null
 */
export async function checkDuplicateByCI(userCi: string): Promise<UserVerification | null> {
  try {
    const q = query(
      collection(firestore, 'user_verifications'),
      where('userCi', '==', userCi)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const existingUser = querySnapshot.docs[0].data() as UserVerification;
      console.warn('[Firestore] CI 중복 발견:', {
        existingUserId: existingUser.userId,
        userName: existingUser.userName,
      });
      return existingUser;
    }

    return null;
  } catch (error) {
    console.error('[Firestore] CI 중복 확인 실패:', error);
    throw error;
  }
}

/**
 * DI 또는 CI로 중복 인증 확인 (포괄적)
 * @param userDi - DI
 * @param userCi - CI
 * @returns 중복 사용자 정보 또는 null
 */
export async function checkDuplicateVerification(
  userDi: string,
  userCi: string
): Promise<{ isDuplicate: boolean; existingUser: UserVerification | null }> {
  try {
    // DI로 먼저 확인
    const duplicateByDI = await checkDuplicateByDI(userDi);
    if (duplicateByDI) {
      return {
        isDuplicate: true,
        existingUser: duplicateByDI,
      };
    }

    // CI로 확인
    const duplicateByCI = await checkDuplicateByCI(userCi);
    if (duplicateByCI) {
      return {
        isDuplicate: true,
        existingUser: duplicateByCI,
      };
    }

    return {
      isDuplicate: false,
      existingUser: null,
    };
  } catch (error) {
    console.error('[Firestore] 중복 인증 확인 실패:', error);
    throw error;
  }
}

/**
 * 본인인증 상태 확인
 * @param userId - Firebase Auth UID
 * @returns 인증 여부
 */
export async function isUserVerified(userId: string): Promise<boolean> {
  try {
    const verification = await getUserVerification(userId);
    return verification !== null;
  } catch (error) {
    console.error('[Firestore] 인증 상태 확인 실패:', error);
    return false;
  }
}
