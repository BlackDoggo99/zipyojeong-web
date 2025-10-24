'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock,
  Send,
  CheckCircle,
  Building,
  Headphones,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: 'general',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 실제로는 여기서 API를 호출하여 문의를 전송
    // 현재는 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    setSubmitted(true);
    
    // 3초 후 폼 리셋
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        inquiryType: 'general',
        message: ''
      });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="px-4 py-2">
            <Headphones className="w-4 h-4 mr-2" />
            고객 지원
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100">
            무엇을 도와드릴까요?
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            집요정 서비스에 대한 모든 문의사항을 빠르고 친절하게 답변해드립니다
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">

            <Card className="dark:bg-gray-900">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>이메일 문의</CardTitle>
                <CardDescription>
                  24시간 접수 가능
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  zipyojeonghelp@gmail.com
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  영업일 2일 이내 답변
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>카카오톡 상담</CardTitle>
                <CardDescription>
                  실시간 채팅 상담
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a href="https://open.kakao.com/me/zipyojeonghelp" target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  상담하기
                </a>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  평일 10:00 - 18:00 운영
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800 dark:text-blue-400">
                  <Clock className="w-5 h-5 mr-2" />
                  평균 응답 시간
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">이메일</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">2일 이내</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">카카오톡</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">1시간 이내</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-2xl">문의하기</CardTitle>
                <CardDescription>
                  아래 양식을 작성해주시면 빠르게 답변드리겠습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      문의가 접수되었습니다!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      빠른 시일 내에 답변드리겠습니다.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">이름 *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="이름을 입력하세요"
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">이메일 *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="이메일을 입력하세요"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">전화번호</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="010-0000-0000"
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company">회사명</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          placeholder="회사명을 입력하세요"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>문의 유형 *</Label>
                      <RadioGroup 
                        value={formData.inquiryType}
                        onValueChange={(value) => setFormData({...formData, inquiryType: value})}
                        disabled={loading}
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="general" id="general" />
                            <Label htmlFor="general" className="cursor-pointer">
                              일반 문의
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pricing" id="pricing" />
                            <Label htmlFor="pricing" className="cursor-pointer">
                              요금제 문의
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="technical" id="technical" />
                            <Label htmlFor="technical" className="cursor-pointer">
                              기술 지원
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="enterprise" id="enterprise" />
                            <Label htmlFor="enterprise" className="cursor-pointer">
                              기업 문의
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">문의 내용 *</Label>
                      <Textarea
                        id="message"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="문의하실 내용을 자세히 작성해주세요"
                        rows={6}
                        disabled={loading}
                      />
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">개인정보 수집 및 이용 동의</p>
                          <p>문의 답변을 위해 이름, 이메일, 전화번호 등의 개인정보를 수집합니다.</p>
                          <p>수집된 정보는 문의 답변 목적으로만 사용되며, 답변 완료 후 1년간 보관됩니다.</p>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          전송 중...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          문의 전송하기
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            자주 묻는 질문
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            문의 전 아래 내용을 확인해보세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-start">
                <FileText className="w-5 h-5 mr-2 mt-0.5 text-blue-600 dark:text-blue-400" />
                웹과 앱을 모두 사용할 수 있나요?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                네, 웹과 모바일 앱을 동일한 계정으로 사용할 수 있으며, 데이터는 실시간으로 동기화됩니다.
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-start">
                <Building className="w-5 h-5 mr-2 mt-0.5 text-green-600 dark:text-green-400" />
                AI 계약서 업로드는 어떻게 작동하나요?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                계약서 사진 한 장만 업로드하면 AI가 자동으로 임차인 정보를 인식하고 등록해드립니다.
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 text-orange-600 dark:text-orange-400" />
                가상계좌로 임대료를 받을 수 있나요?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                네, 가상계좌를 발급받아 임차인에게 전달하면 입금 시 자동으로 확인되고 알림을 받을 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-start">
                <MessageSquare className="w-5 h-5 mr-2 mt-0.5 text-purple-600 dark:text-purple-400" />
                14일 무료체험 후에는 어떻게 되나요?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                체험 기간 종료 후 원하는 요금제를 선택하여 계속 사용하거나, 언제든 계정을 삭제할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link href="/faq">
            <Button variant="outline" size="lg">
              더 많은 FAQ 보기
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
