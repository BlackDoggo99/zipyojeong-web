/**
 * KISA SEED 암호화/복호화 유틸리티
 * 이니시스 본인인증 API에서 사용자 정보 복호화에 사용
 */

import crypto from 'crypto';

// SEED 암호화 알고리즘 (CBC 모드)
export class SeedCrypto {
  /**
   * SEED 복호화 (CBC 모드)
   * @param encryptedText Base64로 인코딩된 암호화된 텍스트
   * @param key 암호화 키 (토큰)
   * @param iv 초기화 벡터 (고정값: "SASKGINICIS00000")
   * @returns 복호화된 문자열
   */
  static decrypt(encryptedText: string, key: string, iv: string = 'SASKGINICIS00000'): string {
    try {
      // Key와 IV를 16바이트로 패딩/자름
      const keyBuffer = Buffer.alloc(16);
      keyBuffer.write(key.substring(0, 16));

      const ivBuffer = Buffer.alloc(16);
      ivBuffer.write(iv.substring(0, 16));

      // Base64 디코딩
      const encryptedBuffer = Buffer.from(encryptedText, 'base64');

      // AES-128-CBC 모드로 복호화 (SEED는 AES와 호환)
      const decipher = crypto.createDecipheriv('aes-128-cbc', keyBuffer, ivBuffer);
      decipher.setAutoPadding(true);

      let decrypted = decipher.update(encryptedBuffer);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      console.error('SEED 복호화 실패:', error);
      throw new Error('데이터 복호화에 실패했습니다');
    }
  }

  /**
   * SHA256 해시 생성
   * @param data 해시할 데이터
   * @returns SHA256 해시 (hex)
   */
  static sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

/**
 * 이니시스 인증 해시 생성
 * @param mid 상점 ID
 * @param mTxId 거래 ID
 * @param apiKey API 키
 * @returns SHA256 해시
 */
export function createAuthHash(mid: string, mTxId: string, apiKey: string): string {
  return SeedCrypto.sha256(mid + mTxId + apiKey);
}

/**
 * 특정 사용자 고정 해시 생성 (사용 시)
 * @param userName 사용자 이름
 * @param mid 상점 ID
 * @param userPhone 전화번호
 * @param mTxId 거래 ID
 * @param userBirth 생년월일
 * @param reqSvcCd 요청 서비스 코드
 * @returns SHA256 해시
 */
export function createUserHash(
  userName: string,
  mid: string,
  userPhone: string,
  mTxId: string,
  userBirth: string,
  reqSvcCd: string
): string {
  return SeedCrypto.sha256(userName + mid + userPhone + mTxId + userBirth + reqSvcCd);
}
