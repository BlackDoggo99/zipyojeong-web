'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { PlanService, SubscriptionPlan } from '@/lib/planService';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Stars,
  Home,
  Building,
  Building2,
  TrendingUp,
  Crown,
  Shield,
  Check,
  Loader2,
  ShoppingCart,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

const pointPlans = [
  {
    id: 'starter',
    name: '스타터 플랜',
    description: '소규모 임대인 전용',
    monthlyPrice: 14900,
    yearlyPrice: Math.floor(14900 * 12 * 0.88), // 12% 할인
    tenantLimit: '5명',
    icon: Home,
    color: 'blue',
    features: [
      '건물/호수 무제한 등록',
      'AI 계약서 업로드 (사진 하나로 임차인 자동등록)',
      '월세 납부 관리',
      '계약 만료 알림',
      '자동 입금 확인',
      '세금 신고용 장부 생성'
    ]
  },
  {
    id: 'basic',
    name: '베이직 플랜',
    description: '소규모 임대인 (원룸·오피스텔)',
    monthlyPrice: 24900,
    yearlyPrice: Math.floor(24900 * 12 * 0.88),
    tenantLimit: '10명',
    icon: Building,
    color: 'green',
    features: [
      '건물/호수 무제한 등록',
      'AI 계약서 업로드 (사진 하나로 임차인 자동등록)',
      '월세 납부 관리',
      '계약 만료 알림',
      '자동 입금 확인',
      '세금 신고용 장부 생성'
    ],
    popular: true
  },
  {
    id: 'standard',
    name: '스탠다드 플랜',
    description: '일반 임대인 (아파트·빌라 다수)',
    monthlyPrice: 54900,
    yearlyPrice: Math.floor(54900 * 12 * 0.88),
    tenantLimit: '30명',
    icon: Building2,
    color: 'purple',
    features: [
      '건물/호수 무제한 등록',
      'AI 계약서 업로드 (사진 하나로 임차인 자동등록)',
      '월세 납부 관리',
      '계약 만료 알림',
      '자동 입금 확인',
      '세금 신고용 장부 생성'
    ]
  },
  {
    id: 'pro',
    name: '프로 플랜',
    description: '중형 임대 사업자 전용',
    monthlyPrice: 84900,
    yearlyPrice: Math.floor(84900 * 12 * 0.88),
    tenantLimit: '50명',
    icon: TrendingUp,
    color: 'orange',
    features: [
      '건물/호수 무제한 등록',
      'AI 계약서 업로드 (사진 하나로 임차인 자동등록)',
      '월세 납부 관리',
      '계약 만료 알림',
      '자동 입금 확인',
      '세금 신고용 장부 생성'
    ]
  }
];

export default function PointsShopPage() {
  const { user, userProfile, userPlan, getUserPoints, purchasePlanWithPoints, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userPoints, setUserPoints] = useState(0);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUserPoints = useCallback(async () => {
    if (!getUserPoints) return;

    try {
      const points = await getUserPoints();
      setUserPoints(points);
    } catch (error) {
      console.error('포인트 로드 실패:', error);
      setError('포인트 정보를 불러오는데 실패했습니다.');
    }
  }, [getUserPoints]);

  useEffect(() => {
    // 인증 로딩이 완료되지 않았다면 기다림
    if (authLoading) return;

    // 인증 로딩 완료 후 사용자가 없다면 로그인 페이지로
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // 사용자가 있다면 포인트 로드
    if (user) {
      loadUserPoints();
    }
  }, [user, authLoading, router, loadUserPoints]);

  const handlePurchase = async (plan: typeof pointPlans[0]) => {
    if (!user || !purchasePlanWithPoints) return;

    const pointCost = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

    if (userPoints < pointCost) {
      setError(`포인트가 부족합니다. ${pointCost.toLocaleString()}P가 필요합니다.`);
      return;
    }

    try {
      setPurchasing(plan.id);
      setError('');

      await purchasePlanWithPoints(plan.id as SubscriptionPlan, plan.name, pointCost, billingCycle);

      setSuccess(`${plan.name} (${billingCycle === 'monthly' ? '월간' : '연간'})이 성공적으로 구매되었습니다!`);
      await loadUserPoints(); // 포인트 재로드

      // 3초 후 대시보드로 이동
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error: unknown) {
      console.error('구매 실패:', error);
      setError((error as Error).message || '구매 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setPurchasing(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 섹션 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                대시보드로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            포인트 상점
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            포인트로 프리미엄 플랜을 구매하고 더 많은 기능을 이용해보세요
          </p>
        </div>

        {/* 현재 포인트 표시 */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Stars className="w-8 h-8" />
                <div>
                  <p className="text-lg font-medium">보유 포인트</p>
                  <p className="text-3xl font-bold">{userPoints.toLocaleString()}P</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">현재 플랜</p>
                <p className="text-lg font-semibold">
                  {userPlan ? PlanService.getPlanInfo(userPlan.plan).name : '무료 플랜'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 메시지 표시 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-700 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20">
            <Check className="h-4 w-4" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* 요금제 토글 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            월간 구매
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            연간 구매
            <Badge variant="secondary" className="ml-2">12% 할인</Badge>
          </span>
        </div>

        {/* 플랜 카드들 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {pointPlans.map((plan) => {
            const Icon = plan.icon;
            const pointCost = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const isAffordable = userPoints >= pointCost;
            const isPurchasing = purchasing === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative border-0 shadow-lg hover:shadow-xl transition-all dark:bg-gray-900 ${
                  plan.popular ? 'ring-2 ring-green-500 scale-105' : ''
                } ${!isAffordable ? 'opacity-60' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge className="bg-green-500 text-white">
                      <Stars className="w-3 h-3 mr-1" />
                      인기
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 bg-${plan.color}-100 dark:bg-${plan.color}-900/30 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-6 h-6 text-${plan.color}-600 dark:text-${plan.color}-400`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center pb-4">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {plan.tenantLimit}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      세입자 관리 가능 인원
                    </div>

                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {pointCost.toLocaleString()}P
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {billingCycle === 'monthly' ? '/월' : '/년'}
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        월 {Math.floor(pointCost / 12).toLocaleString()}P (12% 할인)
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2 text-sm text-left mb-6">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        +{plan.features.length - 4}개 기능 더
                      </li>
                    )}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full ${plan.popular ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    disabled={!isAffordable || isPurchasing}
                    onClick={() => handlePurchase(plan)}
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        구매 중...
                      </>
                    ) : !isAffordable ? (
                      '포인트 부족'
                    ) : (
                      '구매하기'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* 포인트 획득 안내 */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-400 flex items-center">
              <Stars className="w-5 h-5 mr-2" />
              포인트 획득 방법
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-blue-700 dark:text-blue-400">
              <div className="flex items-center">
                <Crown className="w-4 h-4 mr-2" />
                <span>친구 추천: 1명당 5,000P 적립</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                <span>이벤트 참여: 추가 포인트 획득 기회</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                <span>포인트는 만료되지 않습니다</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
    
      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">집</span>
                </div>
                <span className="text-xl font-bold">집요정</span>
              </div>
              <p className="text-gray-400">
                스마트한 임대 관리 솔루션
              </p>
              <p className="text-gray-400 text-xs">
                상호명 : 라이프컴포트 (Life Comfort)
              </p>
              <p className="text-gray-400 text-xs">
                대표 : 이정관, 김민욱
              </p>
              <p className="text-gray-400 text-xs">
                사업자등록번호 : 366-67-00617
              </p>
              <p className="text-gray-400 text-xs">
                주소 : 61940 광주광역시 서구 계수로 76, 301호
              </p>
              <p className="text-gray-400 text-xs">
                이메일 : krlifecomfort@gmail.com
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">서비스</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">기능</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">요금제</Link></li>
                <li><Link href="/download" className="hover:text-white transition-colors">앱 다운로드</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">지원</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">도움말</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">문의하기</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">자주 묻는 질문</Link></li>
                <li><Link href="/account-deletion" className="hover:text-white transition-colors">계정 삭제</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">약관</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 dark:border-gray-900 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 라이프컴포트 (Life Comfort). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

