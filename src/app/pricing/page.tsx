'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// 필요한 컴포넌트들을 import (기존 코드 유지)
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

// =========================================================================
// 💡 [핵심] 1. Cloud Function API URL 및 결제 로직 상수 정의
// =========================================================================
// 확정된 Cloud Function API URL
const INICIS_API_URL = "https://us-central1-zipyojeong-f1e17.cloudfunctions.net/paymentApi";

// KG이니시스 테스트 환경 JS SDK
const INICIS_SDK_URL = "https://stgstdpay.inicis.com/stdjs/INIStdPay.js";
// 운영 환경으로 전환 시: "https://stdpay.inicis.com/stdjs/INIStdPay.js"

// KG이니시스 JS SDK가 전역에 노출된다는 가정 하에 타입 정의
declare var INIStdPay: any;

// 요금제 정보 (기존 코드 유지)
const plans = [
  // ... (plans 배열 내용 유지) ...
  {
    name: '스타터',
    description: '소규모 임대인 전용',
    price: '14,900', // 월간 금액
    tenantLimit: '5명',
    tenantNumber: '5',
    icon: Home,
    color: 'blue',
    features: [
      '건물/호수 무제한 등록',
      'AI 계약서 업로드 (사진 하나로 임차인 자동등록)',
      '월세 납부 관리',
      '계약 만료 알림',
      '자동 입금 확인',
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
      'AI 계약서 업로드 (사진 하나로 임차인 자동등록)',
      '월세 납부 관리',
      '계약 만료 알림',
      '자동 입금 확인',
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
      'AI 계약서 업로드 (사진 하나로 임차인 자동등록)',
      '월세 납부 관리',
      '계약 만료 알림',
      '자동 입금 확인',
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
      'AI 계약서 업로드 (사진 하나로 임차인 자동등록)',
      '월세 납부 관리',
      '계약 만료 알림',
      '자동 입금 확인',
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
      'AI 계약서 업로드 (사진 하나로 임차인 자동등록)',
      '월세 납부 관리',
      '계약 만료 알림',
      '자동 입금 확인',
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
      '자동 입금 확인',
      'AI 계약서 업로드 (사진 하나로 임차인 자동등록)',
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

// =========================================================================
// 💡 [핵심] 2. 결제 요청 함수 정의 (월간 결제만 지원)
// =========================================================================
const handlePaymentRequest = async (plan: typeof plans[0]) => {

    if (typeof INIStdPay === 'undefined') {
        alert("KG이니시스 결제 모듈을 로드하지 못했습니다. 페이지를 새로고침 해 주세요.");
        return;
    }

    // 1. 결제 금액 및 상품명 계산 (월간 결제만)
    const rawPrice = plan.price.replace(/,/g, '');
    const finalAmount = parseInt(rawPrice);

    if (plan.price === '협의') {
        alert("엔터프라이즈 플랜은 '상담 요청' 버튼을 이용해 주세요.");
        return;
    }

    const productName = `집요정 ${plan.name} 플랜 (월간)`;

    try {
        // 2. Cloud Function에 결제 파라미터 생성 요청
        const res = await fetch(`${INICIS_API_URL}/requestPayment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: finalAmount,
                planName: productName,
                // TODO: 실제 사용자의 ID 또는 UID를 추가하여 Cloud Function으로 전달하세요.
                userId: 'USER_ID_PLACEHOLDER'
            }),
        });

        if (!res.ok) throw new Error("결제 파라미터 생성 실패");

        const payData = await res.json();

        // 3. 결제 폼 생성 (KG이니시스 샘플 방식 준수)
        const form = document.createElement('form');
        form.id = 'SendPayForm_id';
        form.method = 'post';
        form.style.display = 'none';

        // 필수 파라미터 설정
        const params = {
            version: '1.0',
            mid: payData.mid,
            goodname: productName,
            oid: payData.oid,
            price: payData.price,
            currency: 'WON',
            buyername: '테스트 사용자', // TODO: 실제 사용자 이름
            buyertel: '01012345678',     // TODO: 실제 사용자 전화번호
            buyeremail: 'test@zipyojeong.com', // TODO: 실제 사용자 이메일
            timestamp: payData.timestamp,
            signature: payData.signature,
            verification: payData.verification,
            mKey: payData.mKey,
            use_chkfake: payData.use_chkfake,
            gopaymethod: 'Card:DirectBank:VBank:HPP', // 결제수단
            acceptmethod: 'HPP(1):va_receipt:below1000:centerCd(Y)',
            returnUrl: `${INICIS_API_URL}/inicisCallback`,
            closeUrl: window.location.href, // 결제창 닫기 시 돌아올 URL
        };

        // 파라미터를 hidden input으로 추가
        Object.entries(params).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
        });

        document.body.appendChild(form);

        // 4. INIStdPay.js의 결제 요청 함수 호출
        INIStdPay.pay('SendPayForm_id');

    } catch (error: any) {
        console.error("결제 요청 중 오류:", error);
        alert(`결제 요청 중 오류가 발생했습니다: ${error.message || '서버 오류'}`);
    }
};

// =========================================================================
// 3. PricingPage 컴포넌트 (기존 코드 유지 및 Button 연결)
// =========================================================================
export default function PricingPage() {
  // 💡 [임시 비활성화] 연간 결제 기능 - PG사 계약 후 활성화 예정
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // 💡 [핵심] INIStdPay SDK 동적 로드
  useEffect(() => {
    // 이미 로드되어 있는지 확인
    if (typeof INIStdPay !== 'undefined') {
      console.log('INIStdPay SDK 이미 로드됨');
      return;
    }

    // SDK 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = INICIS_SDK_URL;
    script.charset = 'UTF-8';
    script.async = true;
    script.onload = () => {
      console.log('INIStdPay SDK 로드 완료');
    };
    script.onerror = () => {
      console.error('INIStdPay SDK 로드 실패');
      alert('결제 모듈을 로드하는 데 실패했습니다. 페이지를 새로고침 해 주세요.');
    };

    document.body.appendChild(script);

    // cleanup
    return () => {
      // SDK 스크립트 제거 (페이지 언마운트 시)
      const existingScript = document.querySelector(`script[src="${INICIS_SDK_URL}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // 💡 [임시 비활성화] 연간 할인 가격 계산 함수
  /*
  const getDiscountedPrice = (price: string) => {
    if (price === '협의') return price;
    const numPrice = parseInt(price.replace(/,/g, ''));
    const yearlyPrice = Math.floor(numPrice * 12 * 0.88); // 12% 할인
    return yearlyPrice.toLocaleString();
  };

  const getAdditionalYearlyPrice = () => {
    const monthlyPrice = 19900;
    const yearlyPrice = Math.floor(monthlyPrice * 12 * 0.88); // 12% 할인
    return yearlyPrice.toLocaleString();
  };
  */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Header />

      {/* Hero Section 및 Billing Toggle (기존 코드 유지) */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ... (Hero Section 내용 유지) ... */}
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

          {/* 💡 [임시 비활성화] Billing Toggle - PG사 계약 후 활성화 예정 */}
          {/*
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
              <Badge variant="secondary" className="ml-2">12% 할인</Badge>
            </span>
          </div>
          */}
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

                {/* ... (CardHeader 및 CardContent 내용 유지) ... */}
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 bg-${plan.color}-100 dark:bg-${plan.color}-900/30 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-6 h-6 text-${plan.color}-600 dark:text-${plan.color}-400`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-xs mt-1 text-gray-900 dark:text-gray-400">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center pb-4">
                  <div className="mb-6">
                    <div className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {plan.tenantNumber}
                      <span className="text-2xl font-normal text-gray-900 dark:text-gray-400">명</span>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-400 mb-4">
                      세입자 관리 가능 인원
                    </div>
                    {!plan.enterprise ? (
                      <>
                        {/* 💡 월간 결제만 표시 */}
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ₩{plan.price}
                        </div>
                        {plan.additionalPrice && (
                          <div className="text-sm text-gray-900 dark:text-gray-400 mt-1">
                            + 10명당 ₩19,900/월
                          </div>
                        )}
                        <div className="text-sm text-gray-900 dark:text-gray-400">
                          /월
                        </div>
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
                        <span className="text-xs text-gray-900 dark:text-gray-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {plan.enterprise ? (
                    // 엔터프라이즈는 상담 요청 링크 유지
                    <Link href="/contact" className="w-full">
                      <Button variant="outline" className="w-full">
                        상담 요청
                      </Button>
                    </Link>
                  ) : (
                    // 💡 [핵심] 일반 요금제는 결제 요청 버튼으로 변경
                    <Button
                      onClick={() => handlePaymentRequest(plan)}
                      className={`w-full ${plan.popular ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                      시작하기
                    </Button>
                    // <Link href="/signup" className="w-full">
                    //   <Button className={`w-full ${plan.popular ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                    //     시작하기
                    //   </Button>
                    // </Link>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Feature Comparison, FAQ, CTA, Footer (기존 코드 유지) */}
      {/* ... (나머지 섹션 내용 유지) ... */}

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
                <td className="p-4 text-gray-900 dark:text-gray-400">건물/호수 등록</td>
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
                <td className="p-4 text-gray-900 dark:text-gray-400">계약서 업로드</td>
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
                <td className="p-4 text-gray-900 dark:text-gray-400">월세 수동 체크</td>
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
                <td className="p-4 text-gray-900 dark:text-gray-400">계약 만료 알림</td>
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
                <td className="p-4 text-gray-900 dark:text-gray-400">세입자별 메모</td>
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
                <td className="p-4 text-gray-900 dark:text-gray-400">문자 인식 자동 입금 확인</td>
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
                <td className="p-4 text-gray-900 dark:text-gray-400">AI 기반 자동 세입자 등록</td>
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
                <td className="p-4 text-gray-900 dark:text-gray-400">세금 신고용 장부</td>
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
                <td className="p-4 text-gray-900 dark:text-gray-400">특약사항 요약 알림</td>
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
                <td className="p-4 text-gray-900 dark:text-gray-400">24/7 AI 지원</td>
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
                <p className="text-gray-900 dark:text-gray-400">
                  네, 모든 플랜은 14일 무료 체험이 가능합니다. 웹에서 간단히 회원가입 후 바로 사용할 수 있으며, 체험 기간 중 언제든 계정을 삭제할 수 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg">웹과 앱이 따로 있나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 dark:text-gray-400">
                  웹에서 가입 후 모바일에서 사용 가능하며, 웹 버전은 추후 개발 예정입니다. 현재 웹에서 구독관련 관리가 가능합니다. 데이터는 실시간으로 동기화됩니다.
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg">결제는 어떻게 하나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 dark:text-gray-400">
                  웹에서 PG사를 통한 다양한 방법으로 결제가 가능하게 제공중입니다.
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
            웹에서 간편 가입으로 14일간 모든 기능을 무료로 체험해보세요
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
                연락처 : 010-9437-8487
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