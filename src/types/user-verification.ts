import { Timestamp } from 'firebase/firestore';

/**
 * KG이니시스 본인인증 결과 데이터 타입
 */
export interface UserVerification {
  /** Firebase Auth UID */
  userId: string;

  /** 복호화된 이름 */
  userName: string;

  /** 복호화된 전화번호 (010-1234-5678 형식) */
  userPhone: string;

  /** 복호화된 생년월일 (YYYY-MM-DD 형식) */
  userBirthday: string;

  /** DI (Duplication Information) - 중복 가입 확인용 */
  userDi: string;

  /** CI (Connection Information) - 본인 확인용 */
  userCi: string;

  /** 성별 (M: 남성, F: 여성) */
  userGender: 'M' | 'F';

  /** 내외국인 구분 (0: 내국인, 1: 외국인) */
  isForeign: '0' | '1';

  /** 인증 시각 */
  verifiedAt: Timestamp;

  /** 트랜잭션 ID (추적용) */
  mTxId: string;

  /** 마지막 업데이트 시각 (선택적) */
  updatedAt?: Timestamp;
}

/**
 * Firestore에 저장할 본인인증 데이터
 * (클라이언트 → Firestore 변환 시 사용)
 */
export interface UserVerificationCreate {
  userId: string;
  userName: string;
  userPhone: string;
  userBirthday: string;
  userDi: string;
  userCi: string;
  userGender: 'M' | 'F';
  isForeign: '0' | '1';
  mTxId: string;
}

/**
 * 본인인증 상태 enum
 */
export enum VerificationStatus {
  /** 미인증 */
  NOT_VERIFIED = 'not_verified',
  /** 인증 완료 */
  VERIFIED = 'verified',
  /** 인증 만료 (필요시 재인증) */
  EXPIRED = 'expired',
}
