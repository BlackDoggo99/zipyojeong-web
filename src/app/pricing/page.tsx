'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import {
  Check,
  X,
  Building,
  Home,
  Building2,
  Crown,
  Sparkles,
  Star,
  TrendingUp,
  Shield
} from 'lucide-react';

const plans = [
  {
    name: '스타터',
    description: '소규모 임대인 전용',
    price: '14,900',
    tenantLimit: '5명',
    tenantNumber: '5',
    icon: Home,
    color: 'blue',
    features: [
      '건물/호수 무제한 등록',
      '계약서 업로드 (PDF/사진)',
      '월세 납부 관리',
      '계약 만료 알림',
      '은행 API 자동 입금 확인',
      '카톡/문자 자동 알림',
      '세금 신고용 장부 생성'
    ],
    popular: false
  },
  {
    name: '베이직',
    description: '소규모 임대인 (원룸·오피스텔)',
    price: '24,900',
    tenantLimit: '10명',
    tenantNumber: '10',
    icon: Building,
    color: 'green',
    features: [
      '건물/호수 무제한 등록',
      '계약서 업로드 (PDF/사진)',
      '월세 납부 관리',
      '계약 만료 알림',
      '은행 API 자동 입금 확인',
      '카톡/문자 자동 알림',
      '세금 신고용 장부 생성'
    ],
    popular: true
  },
  {
    name: '스탠다드',
    description: '일반 임대인 (아파트·빌라 다수)',
    price: '54,900',
    tenantLimit: '30명',
    tenantNumber: '30',
    icon: Building2,
    color: 'purple',
    features: [
      '건물/호수 무제한 등록',
      '계약서 업로드 (PDF/사진)',
      '월세 납부 관리',
      '계약 만료 알림',
      '은행 API 자동 입금 확인',
      '카톡/문자 자동 알림',
      '세금 신고용 장부 생성'
    ],
    popular: false
  },
  {
    name: '프로',
    description: '중형 임대 사업자 전용',
    price: '84,900',
    tenantLimit: '50명',
    tenantNumber: '50',
    icon: TrendingUp,
    color: 'orange',
    features: [
      '건물/호수 무제한 등록',
      '계약서 업로드 (PDF/사진)',
      '월세 납부 관리',
      '계약 만료 알림',
      '은행 API 자동 입금 확인',
      '카톡/문자 자동 알림',
      '세금 신고용 장부 생성'
    ],
    popular: false
  },
  {
    name: '프로 플러스',
    description: '대형 임대 사업자용',
    price: '84,900',
    additionalPrice: '+ 10명당 19,900원',
    tenantLimit: '50+',
    tenantNumber: '50+',
    icon: Crown,
    color: 'indigo',
    features: [
      '건물/호수 무제한 등록',
      '계약서 업로드 (PDF/사진)',
      '월세 납부 관리',
      '계약 만료 알림',
      '은행 API 자동 입금 확인',
      '카톡/문자 자동 알림',
      '세금 신고용 장부 생성'
    ],
    popular: false
  },
  {
    name: '엔터프라이즈',
    description: '법인, 부동산 관리업체',
    price: '협의',
    tenantLimit: '무제한',
    tenantNumber: '∞',
    icon: Shield,
    color: 'gray',
    features: [
      '모든 프로 플러스 기능',
      '전용 서버 옵션',
      'White Label 브랜딩',
      '커스텀 기능 개발',
      'SLA 99.9% 보장',
      '온사이트 교육',
      '24/7 전담 지원팀'
    ],
    popular: false,
    enterprise: true
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const getDiscountedPrice = (price: string) => {
    if (price === '협의') return price;
    const numPrice = parseInt(price.replace(/,/g, ''));
    const yearlyPrice = Math.floor(numPrice * 12 * 0.85); // 15% 할인
    return yearlyPrice.toLocaleString();
  };

  const getAdditionalYearlyPrice = () => {
    const monthlyPrice = 19900;
    const yearlyPrice = Math.floor(monthlyPrice * 12 * 0.85); // 15% 할인
    return yearlyPrice.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            합리적인 가격
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100">
            규모에 맞는 <span className="text-blue-600">완벽한 요금제</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            소규모 임대인부터 대형 관리업체까지, 모든 규모에 최적화된 요금제를 제공합니다
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              월간 결제
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
              연간 결제
              <Badge variant="secondary" className="ml-2">15% 할인</Badge>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name} 
                className={`relative border-0 shadow-lg hover:shadow-xl transition-all dark:bg-gray-900 ${
                  plan.popular ? 'ring-2 ring-green-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge className="bg-green-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
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
                    <div className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {plan.tenantNumber}
                      <span className="text-2xl font-normal text-gray-600 dark:text-gray-400">명</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      세입자 관리 가능 인원
                    </div>
                    {!plan.enterprise ? (
                      <>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {billingCycle === 'monthly' ? 
                            `₩${plan.price}` : 
                            `₩${getDiscountedPrice(plan.price)}`
                          }
                        </div>
                        {plan.additionalPrice && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {billingCycle === 'monthly' ?
                              '+ 10명당 ₩19,900/월' :
                              `+ 10명당 ₩${getAdditionalYearlyPrice()}/년`
                            }
                          </div>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {billingCycle === 'monthly' ? '/월' : '/년'}
                        </div>
                        {billingCycle === 'yearly' && !plan.enterprise && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            월 ₩{Math.floor(parseInt(getDiscountedPrice(plan.price).replace(/,/g, '')) / 12).toLocaleString()} 
                            (15% 할인)
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        맞춤 견적
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-2 text-sm text-left mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  {plan.enterprise ? (
                    <Link href="/contact" className="w-full">
                      <Button variant="outline" className="w-full">
                        상담 요청
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/signup" className="w-full">
                      <Button className={`w-full ${plan.popular ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                        시작하기
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            상세 기능 비교
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            각 플랜별 제공 기능을 자세히 비교해보세요
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded-lg shadow-lg">
            <thead>
              <tr className="border-b dark:border-gray-800">
                <th className="text-left p-4 font-medium text-gray-900 dark:text-gray-100">기능</th>
                <th className="text-center p-4 font-medium text-gray-900 dark:text-gray-100">
                  무료
                  <div className="text-xs font-normal text-gray-500 dark:text-gray-400">체험판</div>
                </th>
                {plans.map((plan) => (
                  <th key={plan.name} className="text-center p-4 font-medium text-gray-900 dark:text-gray-100">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                <td className="p-4 font-bold text-gray-900 dark:text-gray-100">관리 가능 인원</td>
                <td className="text-center p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    5명
                  </div>
                </td>
                {plans.map((plan) => (
                  <td key={plan.name} className="text-center p-4">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {plan.tenantLimit}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <td className="p-4 font-medium text-gray-900 dark:text-gray-100" colSpan={7}>기본 기능</td>
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="p-4 text-gray-600 dark:text-gray-400">건물/호수 등록</td>
                <td className="text-center p-4">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                {plans.map((plan) => (
                  <td key={plan.name} className="text-center p-4">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="p-4 text-gray-600 dark:text-gray-400">계약서 업로드</td>
                <td className="text-center p-4">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                {plans.map((plan) => (
                  <td key={plan.name} className="text-center p-4">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="p-4 text-gray-600 dark:text-gray-400">월세 수동 체크</td>
                <td className="text-center p-4">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                {plans.map((plan) => (
                  <td key={plan.name} className="text-center p-4">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="p-4 text-gray-600 dark:text-gray-400">계약 만료 알림</td>
                <td className="text-center p-4">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                {plans.map((plan) => (
                  <td key={plan.name} className="text-center p-4">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="p-4 text-gray-600 dark:text-gray-400">세입자별 메모</td>
                <td className="text-center p-4">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                {plans.map((plan) => (
                  <td key={plan.name} className="text-center p-4">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr className="border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <td className="p-4 font-medium text-gray-900 dark:text-gray-100" colSpan={7}>프리미엄 기능</td>
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="p-4 text-gray-600 dark:text-gray-400">은행 API 자동 입금 확인</td>
                <td className="text-center p-4">
                  <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                </td>
                {plans.map((plan) => (
                  <td key={plan.name} className="text-center p-4">
                    <Star className="w-5 h-5 text-yellow-500 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="p-4 text-gray-600 dark:text-gray-400">월세 자동 리마인드</td>
                <td className="text-center p-4">
                  <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                </td>
                {plans.map((plan) => (
                  <td key={plan.name} className="text-center p-4">
                    <Star className="w-5 h-5 text-yellow-500 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="p-4 text-gray-600 dark:text-gray-400">세금/회계 리포트</td>
                <td className="text-center p-4">
                  <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                </td>
                {plans.map((plan) => (
                  <td key={plan.name} className="text-center p-4">
                    <Star className="w-5 h-5 text-yellow-500 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="p-4 text-gray-600 dark:text-gray-400">하자/민원 카톡 챗봇</td>
                <td className="text-center p-4">
                  <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                </td>
                {plans.map((plan) => (
                  <td key={plan.name} className="text-center p-4">
                    <Star className="w-5 h-5 text-yellow-500 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="p-4 text-gray-600 dark:text-gray-400">AI 챗봇 고객지원</td>
                <td className="text-center p-4">
                  <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                </td>
                {plans.map((plan) => (
                  <td key={plan.name} className="text-center p-4">
                    <Star className="w-5 h-5 text-yellow-500 mx-auto" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            자주 묻는 질문
          </h2>
          
          <div className="space-y-6">
            <Card className="dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg">무료 체험이 가능한가요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  네, 모든 플랜은 14일 무료 체험이 가능합니다. 신용카드 등록 없이 바로 시작할 수 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg">플랜 변경이 가능한가요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  언제든지 상위 플랜으로 업그레이드하거나 하위 플랜으로 다운그레이드할 수 있습니다. 
                  변경된 요금은 다음 결제일부터 적용됩니다.
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg">환불 정책은 어떻게 되나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  첫 30일 이내에는 100% 환불이 가능합니다. 이후에는 남은 기간에 대해 일할 계산하여 환불해드립니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 lg:p-16 text-center text-white">
          <Shield className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            14일 무료 체험으로 시작하세요
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            신용카드 등록 없이 모든 기능을 체험해보세요
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 집요정. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}