'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { AddressSearch, AddressData } from '@/components/ui/address-search';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState<AddressData | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp } = useAuth();
  const router = useRouter();

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다.';
    }
    if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(password)) {
      return '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 입력값 검증
    if (!address) {
      setError('주소를 입력해주세요.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, name, address, referralCode);
      router.push('/dashboard'); // 회원가입 성공 시 대시보드로 이동
    } catch (error: unknown) {
      console.error('Signup error:', error);
      
      // Firebase 에러 메시지를 한국어로 변환
      let errorMessage = '회원가입 중 오류가 발생했습니다.';

      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = '이미 사용 중인 이메일입니다.';
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = '유효하지 않은 이메일 형식입니다.';
        } else if (firebaseError.code === 'auth/weak-password') {
          errorMessage = '비밀번호가 너무 간단합니다.';
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md dark:bg-gray-900">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">집</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold dark:text-gray-100">집요정 회원가입</CardTitle>
          <CardDescription>
            무료로 계정을 만들어 임대 관리를 시작하세요
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                autoComplete="name"
                lang="ko"
                inputMode="text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                이메일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <AddressSearch
              onAddressSelect={setAddress}
              disabled={loading}
            />

            <div className="space-y-2">
              <Label htmlFor="password">
                비밀번호 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <div className="text-xs text-gray-500">
                8자 이상, 영문+숫자+특수문자(@$!%*?&#) 포함
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                비밀번호 확인 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center text-green-600 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  비밀번호가 일치합니다
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-sm font-medium dark:text-gray-200">
                추천인 코드 (선택)
              </Label>
              <Input
                id="referralCode"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="추천인 코드를 입력하세요"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                maxLength={7}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-green-50 dark:bg-green-950/30 p-2 rounded-md">
                <div className="flex items-center gap-1 mb-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="font-medium">추천인 코드 혜택</span>
                </div>
                • 추천인 코드 입력 시 1개월 프리미엄 플랜 무료 제공<br/>
                • 모든 프리미엄 기능 이용 가능 (5명 임차인 관리, 고급 기능 등)
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-400">무료 플랜 혜택</span>
              </div>
              <ul className="space-y-1 text-blue-700 dark:text-blue-400">
                <li>• 세입자 5명까지 무료 관리</li>
                <li>• 계약 만료 알림</li>
                <li>• 임대료 추적 기능</li>
                <li>• 신용카드 등록 불필요</li>
              </ul>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  계정 생성 중...
                </>
              ) : (
                '무료로 시작하기'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              이미 계정이 있으신가요?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                로그인하기
              </Link>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            회원가입 시{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              이용약관
            </Link>{' '}
            및{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}