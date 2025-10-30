'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2, Home } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/dashboard'); // 로그인 성공 시 대시보드로 이동
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      // Firebase 에러 메시지를 한국어로 변환
      let errorMessage = '로그인 중 오류가 발생했습니다.';

      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/user-not-found') {
          errorMessage = '등록되지 않은 이메일입니다.';
        } else if (firebaseError.code === 'auth/wrong-password') {
          errorMessage = '비밀번호가 틀렸습니다.';
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = '유효하지 않은 이메일 형식입니다.';
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md dark:bg-gray-900">
        <CardHeader className="text-center">
          <div className="flex justify-between items-start mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                <Home className="h-4 w-4 mr-2" />
                메인으로
              </Button>
            </Link>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">집</span>
            </div>
            <div className="w-[88px]"></div> {/* Spacer for centering */}
          </div>
          <CardTitle className="text-2xl font-bold dark:text-gray-100">집요정 로그인</CardTitle>
          <CardDescription>
            계정에 로그인하여 임대 관리를 시작하세요
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
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
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>
          
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">또는</span>
              </div>
            </div>
            
            <Link href="/signup">
              <Button variant="outline" className="w-full">
                회원가입하기
              </Button>
            </Link>
            
            <div className="text-center">
              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}