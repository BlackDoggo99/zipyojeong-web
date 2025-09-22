'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { PlanService } from '@/lib/planService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Users, 
  Smartphone, 
  Download, 
  LogOut,
  Crown,
  Calendar,
  CreditCard,
  Menu,
  X
} from 'lucide-react';

export default function DashboardPage() {
  const { user, userProfile, userPlan, loading, signOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleDownloadApp = () => {
    // 실제 앱 다운로드 링크로 연결 (현재는 플레이스토어 예시)
    window.open('https://play.google.com/store/apps', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/95 dark:bg-gray-950/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* 모바일: 햄버거 메뉴 + 로고 */}
            <div className="flex items-center space-x-3 md:space-x-2">
              {/* 모바일 메뉴 버튼 (왼쪽) */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* 로고 (클릭하면 대시보드로) */}
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">집요정</span>
              </Link>
            </div>
            
            {/* 데스크톱 버튼들 */}
            <div className="hidden md:flex items-center space-x-4">
              <Badge variant={userPlan?.plan !== 'free' ? 'default' : 'secondary'}>
                {userPlan?.plan !== 'free' ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    {userPlan ? PlanService.getPlanInfo(userPlan.plan).name : '무료 플랜'}
                  </>
                ) : (
                  '무료 플랜'
                )}
              </Badge>
              <ThemeToggle />
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>

            {/* 모바일 테마 토글 (오른쪽) */}
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 슬라이드 메뉴 (왼쪽에서 나옴) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* 배경 오버레이 */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* 슬라이드 메뉴 */}
        <div
          className={`absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-950 shadow-xl transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* 메뉴 헤더 */}
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">집요정</span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* 메뉴 아이템들 */}
          <div className="flex flex-col p-4">
            {/* 플랜 상태 */}
            <div className="mb-4 pb-4 border-b dark:border-gray-800">
              <Badge variant={userPlan?.plan !== 'free' ? 'default' : 'secondary'} className="w-full justify-center py-2">
                {userPlan?.plan !== 'free' ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    {userPlan ? PlanService.getPlanInfo(userPlan.plan).name : '무료 플랜'}
                  </>
                ) : (
                  '무료 플랜'
                )}
              </Badge>
            </div>

            <Link 
              href="/dashboard" 
              className="py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              대시보드
            </Link>
            {(!userPlan || userPlan.plan === 'free') && (
              <Link 
                href="/pricing" 
                className="py-3 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                프리미엄 업그레이드
              </Link>
            )}
            <Link 
              href="/contact" 
              className="py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              문의하기
            </Link>
            
            {/* 구분선 */}
            <div className="border-t dark:border-gray-800 my-4" />
            
            {/* 로그아웃 버튼 */}
            <Button variant="ghost" className="w-full justify-start" onClick={() => {
              handleSignOut();
              setIsMenuOpen(false);
            }}>
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              안녕하세요, {userProfile.name}님! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              집요정 앱으로 임대 관리를 시작해보세요.
            </p>
          </div>

          {/* App Download Section */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-6 h-6 mr-2" />
                집요정 앱 다운로드
              </CardTitle>
              <CardDescription className="text-blue-100">
                모바일 앱으로 언제 어디서나 임대 관리를 하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="secondary" 
                  onClick={handleDownloadApp}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  안드로이드 앱 다운로드
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={handleDownloadApp}
                >
                  <Download className="w-4 h-4 mr-2" />
                  iOS 앱 다운로드
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="dark:bg-gray-900">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>세입자 관리</CardTitle>
                <CardDescription>
                  {(!userPlan || userPlan.plan === 'free') ? '최대 5명까지' : userPlan ? `최대 ${PlanService.getPlanInfo(userPlan.plan).tenantLimit === -1 ? '무제한' : `${PlanService.getPlanInfo(userPlan.plan).tenantLimit}명까지`}` : '최대 5명까지'} 세입자 정보를 체계적으로 관리하세요
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="dark:bg-gray-900">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>임대료 추적</CardTitle>
                <CardDescription>
                  임대료 납부 현황을 실시간으로 확인하고 연체자를 쉽게 파악하세요
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="dark:bg-gray-900">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>계약 만료 알림</CardTitle>
                <CardDescription>
                  계약 만료일을 미리 알려드려 갱신 협상을 놓치지 않도록 도와드립니다
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Plan Status */}
          {(!userPlan || userPlan.plan === 'free') && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
              <CardHeader>
                <CardTitle className="text-orange-800 dark:text-orange-400">무료 플랜 사용 중</CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-400">
                  현재 세입자 5명까지 무료로 관리할 수 있습니다. 더 많은 기능이 필요하시면 프리미엄 플랜을 이용해보세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/pricing">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Crown className="w-4 h-4 mr-2" />
                    프리미엄 플랜 알아보기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>시작하기</CardTitle>
              <CardDescription>
                집요정 앱으로 임대 관리를 시작하는 방법
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">앱 다운로드</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">집요정 모바일 앱을 다운로드하세요</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">동일한 계정으로 로그인</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">웹사이트와 동일한 이메일로 앱에 로그인하세요</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">세입자 정보 추가</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">첫 번째 세입자 정보를 추가하고 관리를 시작하세요</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}