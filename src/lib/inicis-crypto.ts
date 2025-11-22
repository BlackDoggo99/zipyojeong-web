/**
 * KG이니시스 본인인증 암호화/복호화 유틸리티
 */

import crypto from 'crypto';
import CryptoJS from 'crypto-js';

/**
 * SHA256 해시 생성 (authHash)
 * @param mid - 상점ID
 * @param mTxId - 트랜잭션 ID
 * @param apiKey - API Key
 * @returns SHA256 해시값
 */
export function generateAuthHash(mid: string, mTxId: string, apiKey: string): string {
  const data = mid + mTxId + apiKey;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * AES-256-CBC 암호화 (SEED 대체)
 * 이니시스는 SEED 암호화를 권장하지만, Node.js에서 SEED를 기본 지원하지 않으므로
 * AES-256-CBC를 사용합니다. 실제 운영 전에 이니시스 기술지원팀에 문의 필요.
 *
 * @param plainText - 평문
 * @param key - API Key (32 byte로 조정)
 * @param iv - SEED IV (16 byte로 조정)
 * @returns Base64 인코딩된 암호문
 */
export function aesEncrypt(plainText: string, key: string, iv: string): string {
  try {
    // Key를 32 byte로 조정 (AES-256)
    const keyBytes = CryptoJS.enc.Utf8.parse(key.padEnd(32, '0').substring(0, 32));
    // IV를 16 byte로 조정
    const ivBytes = CryptoJS.enc.Utf8.parse(iv.padEnd(16, '0').substring(0, 16));

    const encrypted = CryptoJS.AES.encrypt(plainText, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  } catch (error) {
    console.error('암호화 실패:', error);
    throw new Error('데이터 암호화에 실패했습니다.');
  }
}

/**
 * AES-256-CBC 복호화
 *
 * @param encryptedText - Base64 인코딩된 암호문
 * @param key - API Key (32 byte로 조정)
 * @param iv - SEED IV (16 byte로 조정)
 * @returns 복호화된 평문
 */
export function aesDecrypt(encryptedText: string, key: string, iv: string): string {
  try {
    // Key를 32 byte로 조정 (AES-256)
    const keyBytes = CryptoJS.enc.Utf8.parse(key.padEnd(32, '0').substring(0, 32));
    // IV를 16 byte로 조정
    const ivBytes = CryptoJS.enc.Utf8.parse(iv.padEnd(16, '0').substring(0, 16));

    const decrypted = CryptoJS.AES.decrypt(encryptedText, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('복호화 실패:', error);
    throw new Error('데이터 복호화에 실패했습니다.');
  }
}

/**
 * 고유 트랜잭션 ID 생성 (20 byte)
 * 형식: timestamp(13) + random(7)
 * @returns 20자리 고유 트랜잭션 ID
 */
export function generateMTxId(): string {
  const timestamp = Date.now().toString(); // 13자리
  const random = Math.random().toString(36).substring(2, 9); // 7자리
  return (timestamp + random).substring(0, 20);
}

/**
 * 전화번호 포맷팅 (010-1234-5678 → 01012345678)
 * @param phone - 하이픈 포함 전화번호
 * @returns 하이픈 제거된 전화번호
 */
export function removePhoneHyphens(phone: string): string {
  return phone.replace(/-/g, '');
}

/**
 * 전화번호 포맷팅 (01012345678 → 010-1234-5678)
 * @param phone - 하이픈 없는 전화번호
 * @returns 하이픈 추가된 전화번호
 */
export function formatPhoneNumber(phone: string): string {
  if (phone.length === 10) {
    return `${phone.substring(0, 3)}-${phone.substring(3, 6)}-${phone.substring(6)}`;
  } else if (phone.length === 11) {
    return `${phone.substring(0, 3)}-${phone.substring(3, 7)}-${phone.substring(7)}`;
  }
  return phone;
}

/**
 * 생년월일 포맷팅 (YYYYMMDD → YYYY-MM-DD)
 * @param birthday - 8자리 생년월일
 * @returns 하이픈 추가된 생년월일
 */
export function formatBirthday(birthday: string): string {
  if (birthday.length === 8) {
    return `${birthday.substring(0, 4)}-${birthday.substring(4, 6)}-${birthday.substring(6)}`;
  }
  return birthday;
}
