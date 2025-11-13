import { NextRequest, NextResponse } from 'next/server';
import { createAuthHash } from '@/lib/seed-crypto';

/**
 * 이니시스 통합 본인인증 요청 API
 * POST /api/auth-verification/request
 */
export async function POST(request: NextRequest) {
  try {
    // 이니시스 설정 (환경변수에서 가져오기)
    const mid = process.env.INICIS_MID || 'INIiasTest'; // 테스트 MID
    const apiKey = process.env.INICIS_API_KEY || 'TGdxb2l3enJDWFRTbTgvREU3MGYwUT09'; // 테스트 API Key

    // 고유한 거래 ID 생성 (타임스탬프 기반)
    const mTxId = `WEB_${Date.now()}`;

    // 인증 해시 생성
    const authHash = createAuthHash(mid, mTxId, apiKey);

    // 요청 서비스 코드 (01: 간편인증, 02: 전자서명, 03: 본인확인)
    const reqSvcCd = '01'; // 간편인증

    // 이니시스 인증창 URL
    const authUrl = 'https://sa.inicis.com/auth';

    // 성공/실패 콜백 URL (결과 페이지로 리다이렉트)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/auth-verification-result`;
    const failUrl = `${baseUrl}/auth-verification-result`;

    // 요청 파라미터
    const requestParams = {
      mid,
      reqSvcCd,
      mTxId,
      authHash,
      reservedMsg: 'isUseToken=Y', // 결과조회 응답 시 개인정보 SEED 암호화 처리 요청
      successUrl,
      failUrl,
      authUrl,
    };

    return NextResponse.json({
      success: true,
      data: requestParams,
    });
  } catch (error) {
    console.error('본인인증 요청 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '본인인증 요청 생성 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
