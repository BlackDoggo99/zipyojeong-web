// app/account-deletion/page.tsx

'use client';

import { useState } from 'react';
import { getAuth, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AccountDeletionPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handleDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);

      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid }),
      });

      if (!response.ok) {
        throw new Error('계정 데이터 삭제에 실패했습니다.');
      }

      await deleteUser(user);

      alert('계정이 성공적으로 삭제되었습니다.');
      router.push('/');
    } catch (err: any) {
      console.error('계정 삭제 오류:', err);
      
      if (err.code === 'auth/wrong-password') {
        setError('비밀번호가 올바르지 않습니다.');
      } else if (err.code === 'auth/user-not-found') {
        setError('사용자를 찾을 수 없습니다.');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('보안을 위해 다시 로그인해주세요.');
      } else {
        setError('계정 삭제 중 오류가 발생했습니다: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏠</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">집요정</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-gray-800/50 overflow-hidden border border-gray-100 dark:border-gray-800">
          {/* 타이틀 섹션 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">계정 삭제</h2>
            <p className="text-blue-100 dark:text-blue-200 mt-2">집요정 서비스를 이용해주셔서 감사합니다</p>
          </div>

          <div className="p-8">
            {!showConfirm ? (
              <>
                {/* 경고 메시지 */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-600 p-6 mb-6 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-3">⚠️ 계정 삭제 전 확인사항</h3>
                      <p className="text-amber-800 dark:text-amber-300 mb-3">계정 삭제 시 다음 데이터가 영구적으로 삭제되며 복구할 수 없습니다:</p>
                      <ul className="space-y-2 text-amber-800 dark:text-amber-300">
                        <li className="flex items-start">
                          <span className="text-amber-500 dark:text-amber-400 mr-2">•</span>
                          <span>사용자 프로필 정보 (이름, 이메일, 연락처)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-500 dark:text-amber-400 mr-2">•</span>
                          <span>등록한 모든 임대 매물 정보</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-500 dark:text-amber-400 mr-2">•</span>
                          <span>임차인 관리 데이터 및 거래 기록</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-500 dark:text-amber-400 mr-2">•</span>
                          <span>앱 내 저장된 문서 및 이미지</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-500 dark:text-amber-400 mr-2">•</span>
                          <span>활동 내역 및 설정 정보</span>
                        </li>
                      </ul>
                      <p className="text-amber-900 dark:text-amber-200 font-semibold mt-4">이 작업은 되돌릴 수 없습니다.</p>
                    </div>
                  </div>
                </div>

                {/* 삭제 절차 안내 */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">계정 삭제 절차</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">1</div>
                      <p className="ml-4 text-gray-700 dark:text-gray-300 mt-1">로그인 상태에서 계정 삭제를 진행하세요</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">2</div>
                      <p className="ml-4 text-gray-700 dark:text-gray-300 mt-1">본인 확인을 위해 이메일과 비밀번호를 입력하세요</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">3</div>
                      <p className="ml-4 text-gray-700 dark:text-gray-300 mt-1">최종 확인 후 계정이 즉시 삭제됩니다</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowConfirm(true)}
                  className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  계정 삭제 진행
                </button>

                {/* 고객 지원 */}
                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">다른 문의사항이 있으신가요?</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    계정 삭제 관련 문의나 도움이 필요하신 경우 고객지원팀으로 연락주세요.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    📧 이메일: <a href="mailto:support@zipyojeong.com" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">support@zipyojeong.com</a>
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                    * 계정 삭제 요청은 영업일 기준 7일 이내에 처리됩니다.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* 본인 확인 폼 */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">본인 확인</h3>
                  <p className="text-gray-600 dark:text-gray-400">계정 삭제를 위해 로그인 정보를 다시 한번 확인합니다.</p>
                </div>

                <form onSubmit={handleDeleteRequest} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      비밀번호
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="비밀번호를 입력하세요"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded-r-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowConfirm(false);
                        setError('');
                        setEmail('');
                        setPassword('');
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                      취소
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${
                        loading 
                          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 shadow-md hover:shadow-lg'
                      } text-white`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          처리 중...
                        </span>
                      ) : (
                        '계정 삭제'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>© 2025 집요정. All rights reserved.</p>
            <p className="mt-2">
              <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">홈으로 돌아가기</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
