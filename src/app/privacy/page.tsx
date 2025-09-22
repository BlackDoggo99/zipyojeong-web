import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { ArrowLeft, Info } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/">
              <Button variant="outline" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>

            <Badge variant="outline" className="mb-4">개인정보 처리방침</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              집요정 개인정보 처리방침
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              집요정은 임대 관리 서비스 제공을 위해 필요한 최소한의 개인정보만을 수집하며, 수집된 정보는 안전하게 보호됩니다.
            </p>
          </div>

          {/* Privacy Content */}
          <Card className="shadow-lg dark:bg-gray-900">
            <CardContent className="p-8 space-y-8">

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">1. 개인정보의 처리 목적</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  라이프컴포트(Life Comfort)(&quot;https://zipyojeong-web.vercel.app&quot; 이하 &quot;집요정&quot;)은 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.
                </p>
                <ul className="space-y-2 ml-4 text-gray-700 dark:text-gray-300">
                  <li>• 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                  <li>• 임대 관리 서비스 제공 (임차인 정보 관리, 임대료 납부 관리, 주소 관리)</li>
                  <li>• PG사 연동 결제 서비스 제공 및 가상계좌 발급</li>
                  <li>• 본인인증 서비스 제공</li>
                  <li>• 고객 상담 및 민원 처리, 공지사항 전달</li>
                  <li>• 서비스 이용 통계 분석 및 서비스 개선</li>
                  <li>• 이체 내역 알림 및 자동 입금 처리</li>
                  <li>• 마케팅 및 광고에 활용</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">2. 개인정보의 처리 및 보유기간</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    ① 집요정은 정보주체로부터 개인정보를 수집할 때 동의받은 개인정보 보유·이용기간 또는 법령에 따른 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    ② 구체적인 개인정보 처리 및 보유기간은 다음과 같습니다.
                  </p>
                  <ul className="space-y-2 ml-4 text-gray-700 dark:text-gray-300">
                    <li>• 회원정보: 회원 탈퇴 시까지</li>
                    <li>• 임차인 정보: 사용자가 직접 삭제하거나 회원 탈퇴 시까지</li>
                    <li>• 임대료 납부 기록: 사용자가 직접 삭제하거나 회원 탈퇴 시까지</li>
                    <li>• 주소 정보: 회원 탈퇴 시까지</li>
                    <li>• 결제 기록: 전자상거래법에 따라 5년</li>
                    <li>• 본인인증 기록: 정보통신망법에 따라 6개월</li>
                    <li>• 서비스 이용 기록: 3년</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">3. 처리하는 개인정보의 항목</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  집요정은 다음의 개인정보 항목을 처리하고 있습니다.
                </p>
                <div className="space-y-4 ml-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">① 회원가입·관리</h3>
                    <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• 필수항목: 이름, 이메일주소, 비밀번호, 주소(우편번호, 기본주소, 상세주소)</li>
                      <li>• 선택항목: 없음</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">② 임대 관리 서비스 제공</h3>
                    <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• 임차인 정보: 성명, 전화번호, 주소, 계약 정보</li>
                      <li>• 임대료 정보: 납부일, 납부 금액, 메모</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">③ 결제 서비스 제공</h3>
                    <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• 결제 정보: 카드번호, 유효기간, CVC, 카드소유자명</li>
                      <li>• 계좌 정보: 은행명, 계좌번호, 예금주명 (가상계좌 발급 시)</li>
                      <li>• 본인인증 정보: 이름, 생년월일, 성별, 휴대폰번호, 통신사</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">④ 자동 수집 정보</h3>
                    <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보, 결제기록</li>
                      <li>• 기기 정보 (모델명, OS버전, 앱 버전)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">4. 개인정보의 제3자 제공</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    ① 집요정은 정보주체의 개인정보를 개인정보 처리 목적에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    ② 집요정은 다음과 같이 개인정보를 제3자에게 제공하고 있습니다.
                  </p>
                  <div className="space-y-4 ml-4">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">• Firebase (Google Inc.)</h4>
                      <ul className="ml-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>- 제공받는 자: Google Inc.</li>
                        <li>- 제공 목적: 클라우드 데이터베이스 및 인증 서비스</li>
                        <li>- 제공 항목: 이메일주소, 서비스 이용 데이터</li>
                        <li>- 보유 기간: 회원 탈퇴시 또는 제공 동의 철회시까지</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">• PG사 (결제 서비스 제공업체)</h4>
                      <ul className="ml-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>- 제공받는 자: 제휴 PG사</li>
                        <li>- 제공 목적: 결제 처리, 가상계좌 발급, 본인인증</li>
                        <li>- 제공 항목: 결제정보, 본인인증정보, 가상계좌 정보</li>
                        <li>- 보유 기간: 결제 완료 후 법정 보존 기간</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">5. 개인정보처리의 위탁</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    ① 집요정은 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
                  </p>
                  <div className="space-y-4 ml-4">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">• Firebase (Google Inc.)</h4>
                      <ul className="ml-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>- 위탁받는 자: Google Inc.</li>
                        <li>- 위탁업무 내용: 클라우드 데이터베이스, 사용자 인증, 푸시 알림</li>
                        <li>- 위탁기간: 서비스 제공 기간</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">• 다음 우편번호 서비스</h4>
                      <ul className="ml-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>- 위탁받는 자: (주)카카오</li>
                        <li>- 위탁업무 내용: 주소 검색 서비스 제공</li>
                        <li>- 위탁기간: 서비스 제공 기간</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    ② 집요정은 위탁계약 체결시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">6. 정보주체의 권리·의무 및 그 행사방법</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    ① 정보주체는 집요정에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
                  </p>
                  <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                    <li>• 개인정보 처리현황 통지요구</li>
                    <li>• 오류 등이 있을 경우 정정·삭제 요구</li>
                    <li>• 처리정지 요구</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300">
                    ② 제1항에 따른 권리 행사는 집요정에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 집요정은 이에 대해 지체 없이 조치하겠습니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    ③ 정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 집요정은 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">7. 개인정보의 파기</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    ① 집요정은 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    ② 개인정보 파기의 절차 및 방법은 다음과 같습니다.
                  </p>
                  <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                    <li>• 파기절차: 집요정은 파기 사유가 발생한 개인정보를 선정하고, 집요정의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</li>
                    <li>• 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">8. 개인정보의 안전성 확보조치</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  집요정은 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
                </p>
                <ul className="space-y-2 ml-4 text-gray-700 dark:text-gray-300">
                  <li>• 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
                  <li>• 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
                  <li>• 물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
                  <li>• 생체인증 및 PIN 코드: 앱 내 민감한 임대 정보 보호를 위한 추가 보안</li>
                  <li>• HTTPS 통신: 모든 데이터 전송 시 암호화 적용</li>
                  <li>• PG사 보안: 제휴 PG사의 검증된 보안 시스템 활용</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">9. 개인정보 보호책임자</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    ① 집요정은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">▶ 개인정보 보호책임자</h4>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                      <li>성명: 집요정 개발팀</li>
                      <li>연락처: zipyojeonghelp@gmail.com</li>
                    </ul>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    ② 정보주체께서는 집요정의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">10. 개인정보 처리방침 변경</h2>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p>
                    이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                  </p>
                  <p className="font-medium">
                    이 개인정보 처리방침은 2025년 1월 1일부터 시행됩니다.
                  </p>
                </div>
              </section>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg">
                <div className="flex items-center mb-3">
                  <Info className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800 dark:text-blue-400">
                    궁금한 사항이 있으시면 고객센터로 문의해주세요.
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  이메일: zipyojeonghelp@gmail.com
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}