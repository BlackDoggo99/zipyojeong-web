import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import {
  Smartphone,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  Shield,
  Check,
  Zap,
  Clock,
  Download,
  Apple
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            임대 관리의 새로운 기준
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            임대 관리, <br />
            <span className="text-blue-600">집요정</span>과 함께 <br />
            <span className="text-green-600">간편하게</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            세입자 정보부터 임대료 관리, 계약 만료 알림까지. <br />
            모든 임대 업무를 스마트폰 하나로 해결하세요.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-4 text-lg">
                <Smartphone className="w-5 h-5 mr-2" />
                무료로 시작하기
              </Button>
            </Link>
            <Link href="#download">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-gray-300 dark:border-gray-600 dark:text-gray-100">
                <Download className="w-5 h-5 mr-2" />
                앱 다운로드
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              신용카드 없이 시작
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              무료 기능 무제한 사용
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              추천 가입시 1개월 프리미엄
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline">핵심 기능</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
            임대 관리의 모든 것을 한 곳에서
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            복잡했던 임대 업무가 이제 간단해집니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-900">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>세입자 관리</CardTitle>
              <CardDescription>
                세입자 정보를 체계적으로 관리하고 연락처, 계약 정보를 한눈에 확인하세요.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-900">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>임대료 추적</CardTitle>
              <CardDescription>
                임대료 납부 현황을 실시간으로 확인하고 연체자를 쉽게 파악할 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-900">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>계약 만료 알림</CardTitle>
              <CardDescription>
                계약 만료일을 미리 알려드려 갱신 협상을 놓치지 않도록 도와드립니다.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-900">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>수익 분석</CardTitle>
              <CardDescription>
                임대 수익을 차트로 시각화하여 투자 성과를 명확하게 파악하세요.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-900">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>클라우드 백업</CardTitle>
              <CardDescription>
                소중한 데이터를 안전하게 클라우드에 보관하여 언제 어디서나 접근하세요.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-900">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>실시간 알림</CardTitle>
              <CardDescription>
                중요한 일정과 납부 알림을 푸시 알림으로 받아 놓치지 마세요.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* App Download Section */}
      <section id="download" className="bg-gradient-to-r from-blue-600 to-green-600 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              모바일 앱으로 언제 어디서나 관리하세요
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              집요정 앱을 다운로드하고 스마트한 임대 관리를 시작하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                <Smartphone className="w-5 h-5 mr-2" />
                Android 다운로드
              </Button>
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg opacity-75 cursor-not-allowed" disabled>
                <Apple className="w-5 h-5 mr-2" />
                iOS (준비중)
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-4">
              Android 5.0 이상 지원 | iOS 버전은 곧 출시 예정입니다
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-blue-600">5명</div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">무료 관리 가능</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-green-600">∞</div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">무제한 무료 사용</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-orange-600">0원</div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">시작 비용</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-purple-600">24/7</div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">언제든 시작 가능</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 lg:p-16 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            5명까지 완전 무료! 신용카드 등록 없이 바로 시작할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                무료로 시작하기
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-gray-900 dark:text-white hover:bg-white hover:text-blue-600">
                요금제 보기
              </Button>
            </Link>
          </div>
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
