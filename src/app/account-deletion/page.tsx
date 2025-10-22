'use client'; // App Router 사용 시

import { useState } from 'react';
import { getAuth, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // App Router
// import { useRouter } from 'next/router'; // Pages Router

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

      // 재인증 (보안을 위해 필수)
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);

      // 서버에 삭제 요청 (Firebase의 다른 데이터 삭제)
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

      // Firebase Auth 계정 삭제
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
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>계정 삭제</h1>
      
      <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '5px', padding: '15px', marginBottom: '20px' }}>
        <h3>⚠️ 주의사항</h3>
        <p>계정 삭제 시 다음 데이터가 영구적으로 삭제됩니다:</p>
        <ul>
          <li>사용자 프로필 정보</li>
          <li>앱 내 저장된 모든 데이터</li>
          <li>활동 기록</li>
        </ul>
        <p style={{ color: '#d9534f', fontWeight: 'bold' }}>이 작업은 취소할 수 없습니다.</p>
      </div>

      {!showConfirm ? (
        <div>
          <h2>계정 삭제 절차</h2>
          <ol>
            <li>로그인 상태에서 아래 버튼을 클릭하세요</li>
            <li>본인 확인을 위해 비밀번호를 입력하세요</li>
            <li>최종 확인 후 계정이 삭제됩니다</li>
          </ol>
          
          <button 
            onClick={() => setShowConfirm(true)}
            style={{
              backgroundColor: '#d9534f',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            계정 삭제 진행
          </button>

          <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <h3>다른 문의사항이 있으신가요?</h3>
            <p>이메일: <a href="mailto:support@zipyojeong.com">support@zipyojeong.com</a></p>
            <p>계정 삭제 요청은 영업일 기준 7일 이내에 처리됩니다.</p>
          </div>
        </div>
      ) : (
        <div>
          <h2>본인 확인</h2>
          <p>계정 삭제를 위해 비밀번호를 입력해주세요.</p>
          
          <form onSubmit={handleDeleteRequest}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>이메일</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>비밀번호</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            {error && (
              <div style={{ 
                backgroundColor: '#f8d7da', 
                color: '#721c24', 
                padding: '10px', 
                borderRadius: '5px', 
                marginBottom: '15px' 
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                취소
              </button>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#ccc' : '#d9534f',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  flex: 1
                }}
              >
                {loading ? '처리 중...' : '계정 삭제'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
