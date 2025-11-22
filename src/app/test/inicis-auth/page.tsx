'use client';

import { useState } from 'react';
import InicisAuthButton from '@/components/auth/InicisAuthButton';

interface AuthResult {
  userName: string;
  userPhone: string;
  userBirthday: string;
  userGender: 'M' | 'F';
  isForeign: '0' | '1';
  userDi: string;
  userCi: string;
  mTxId: string;
}

export default function InicisAuthTestPage() {
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  const handleSuccess = (result: AuthResult) => {
    console.log('✅ 본인인증 성공:', result);
    setAuthResult(result);
    setError(null);
  };

  const handleFail = (err: { code: string; message: string }) => {
    console.error('❌ 본인인증 실패:', err);
    setError(err);
    setAuthResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            KG이니시스 본인인증 테스트
          </h1>
          <p className="text-gray-600">
            본인인증 버튼을 클릭하여 테스트하세요.
          </p>
        </div>

        {/* 본인인증 버튼 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">1. 본인인증 실행</h2>
          <InicisAuthButton
            onSuccess={handleSuccess}
            onFail={handleFail}
          />
        </div>

        {/* 성공 결과 표시 */}
        {authResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-green-900 mb-4">
              ✅ 본인인증 성공
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">이름:</span>
                <span className="text-gray-900">{authResult.userName}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">전화번호:</span>
                <span className="text-gray-900">{authResult.userPhone}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">생년월일:</span>
                <span className="text-gray-900">{authResult.userBirthday}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">성별:</span>
                <span className="text-gray-900">{authResult.userGender === 'M' ? '남성' : '여성'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">내외국인:</span>
                <span className="text-gray-900">{authResult.isForeign === '0' ? '내국인' : '외국인'}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">DI:</span>
                <span className="text-gray-900 font-mono text-xs">{authResult.userDi}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">CI:</span>
                <span className="text-gray-900 font-mono text-xs">{authResult.userCi}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">트랜잭션 ID:</span>
                <span className="text-gray-900 font-mono text-xs">{authResult.mTxId}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <button
                onClick={() => setAuthResult(null)}
                className="text-sm text-green-700 hover:text-green-900"
              >
                결과 초기화
              </button>
            </div>
          </div>
        )}

        {/* 실패 결과 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-900 mb-4">
              ❌ 본인인증 실패
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">오류 코드:</span>
                <span className="text-red-900">{error.code}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">오류 메시지:</span>
                <span className="text-red-900">{error.message}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-200">
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-700 hover:text-red-900"
              >
                오류 초기화
              </button>
            </div>
          </div>
        )}

        {/* 사용 가이드 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 사용 가이드</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">1. 테스트 진행 방법</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>위의 "본인인증" 버튼을 클릭합니다.</li>
                <li>팝업이 열리면 본인인증을 진행합니다.</li>
                <li>테스트 인증 또는 실제 인증을 선택할 수 있습니다.</li>
                <li>인증이 완료되면 결과가 자동으로 표시됩니다.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">2. 환경 설정 확인</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>MID: vercel6ias</li>
                <li>API Key: 5276b2ed5a132697ffa97d1408a43dc6</li>
                <li>SEED IV: SASVERCEL6IAS000</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">3. 도메인 등록</h3>
              <p className="ml-2">
                이니시스 상점관리자에서 <strong>vercel.app</strong> 도메인을 등록해야 합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
