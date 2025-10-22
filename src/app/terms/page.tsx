import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function TermsPage() {
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

            <Badge variant="outline" className="mb-4">서비스 이용약관</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              집요정 서비스 이용약관
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              집요정 임대 관리 서비스 이용에 관한 기본 약관입니다. 서비스 이용 전 반드시 확인해 주세요.
            </p>
          </div>

          {/* Terms Content */}
          <Card className="shadow-lg dark:bg-gray-900">
            <CardContent className="p-8 space-y-8">

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제1조 (목적)</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  이 약관은 라이프컴포트(Life Comfort)(이하 &quot;회사&quot;)가 제공하는 집요정 임대 관리 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제2조 (정의)</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
                </p>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    1. &quot;서비스&quot;란 회사가 제공하는 임대 관리 솔루션으로, 임차인 정보 관리, 임대료 납부 관리, 계약 관리, 리포트 생성, 결제 서비스 등의 기능을 포함합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    2. &quot;이용자&quot;란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    3. &quot;회원&quot;이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    4. &quot;비회원&quot;이란 회원에 가입하지 않고 회사가 제공하는 무료 체험 서비스를 이용하는 자를 말합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    5. &quot;임대 데이터&quot;란 이용자가 서비스 이용 과정에서 입력하는 임차인 정보, 임대료 정보, 계약 정보, 주소 정보 등을 말합니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제3조 (약관의 효력 및 변경)</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    2. 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지 또는 통지함으로써 효력이 발생합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    3. 이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있으며, 계속 이용할 경우 약관 변경에 동의한 것으로 간주됩니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제4조 (서비스의 제공)</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  회사가 제공하는 서비스는 다음과 같습니다.
                </p>
                <div className="space-y-4 ml-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">1. 임차인 정보 관리</h3>
                    <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• 임차인 기본 정보 등록 및 관리</li>
                      <li>• 계약 정보 및 납부 조건 관리</li>
                      <li>• 주소 정보 관리</li>
                      <li>• 임대차 계약서 등록 및 관리</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">2. 임대료 관리</h3>
                    <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• 임대료 납부 기록 관리</li>
                      <li>• 납부 일정 및 연체 관리</li>
                      <li>• 자동 알림 서비스</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">3. 리포트 및 통계</h3>
                    <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• 월별, 연간 수익 리포트</li>
                      <li>• 납부 현황 통계</li>
                      <li>• 엑셀/PDF 장부 내보내기</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">4. 알림 서비스</h3>
                    <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• 납부일 알림</li>
                      <li>• 연체 알림</li>
                      <li>• 계약 만료 알림</li>
                      <li>• 이체 내역 실시간 알림</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">5. 클라우드 동기화</h3>
                    <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• 다중 기기 동기화</li>
                      <li>• 데이터 백업 및 복원</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">6. 인증 및 보안 서비스</h3>
                    <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• PG사 본인인증 서비스</li>
                      <li>• 생체인증 및 PIN 보안</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제5조 (회원가입 및 계정 관리)</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
                  </p>
                  <ul className="ml-8 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                    <li>• 등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                    <li>• 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300">
                    3. 회원가입계약의 성립시기는 회사의 승낙이 이용자에게 도달한 시점으로 합니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제6조 (서비스 이용료 및 결제)</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    1. 회사의 서비스는 기본적으로 무료 체험 서비스와 유료 구독 서비스로 구분됩니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    2. 유료 구독 서비스의 이용료, 결제방법, 결제일 등은 서비스 화면에 표시된 내용에 따릅니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    3. 이용료는 월별 또는 연별 선불 결제를 원칙으로 하며, PG사를 통한 안전한 결제 시스템을 제공합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    4. 회원이 이용료를 납부하지 않을 경우, 회사는 서비스 제공을 중단할 수 있습니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    5. 환불 정책은 별도로 정한 환불 규정에 따릅니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제7조 (회원의 의무)</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    1. 이용자는 다음 행위를 하여서는 안됩니다.
                  </p>
                  <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• 신청 또는 변경시 허위내용의 등록</li>
                    <li>• 타인의 정보 도용</li>
                    <li>• 회사가 게시한 정보의 변경</li>
                    <li>• 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                    <li>• 회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                    <li>• 회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                    <li>• 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                    <li>• PG사 결제 시스템을 부정 이용하거나 허위 결제 정보를 입력하는 행위</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300">
                    2. 회원은 관계법령, 이 약관의 규정, 이용안내 및 서비스상에 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안됩니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제8조 (개인정보보호)</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    1. 회사는 이용자의 개인정보 수집시 서비스 제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    2. 회사는 이용자의 개인정보를 수집·이용하는 때에는 당해 이용자에게 그 목적을 고지하고 동의를 받습니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    3. 회사는 수집된 개인정보를 목적외의 용도로 이용할 수 없으며, PG사 본인인증 및 결제 처리를 위한 경우에만 필요 최소한의 정보를 제휴사에 제공합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    4. 자세한 내용은 별도의 개인정보처리방침에서 확인할 수 있습니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제9조 (회사의 의무)</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    1. 회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    2. 회사는 이용자가 안전하게 인터넷 서비스를 이용할 수 있도록 이용자의 개인정보(신용정보 포함)보호를 위한 보안 시스템을 구축하여야 합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    3. 회사는 이용자의 임대 데이터를 안전하게 보관하며, 허가되지 않은 제3자에게 제공하지 않습니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    4. 회사는 PG사와의 연동을 통해 안전하고 신뢰할 수 있는 결제 환경을 제공하도록 노력합니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제10조 (손해배상 및 면책조)</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    1. 회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 동 손해가 회사의 고의 또는 중대한 과실에 의한 경우를 제외하고 이에 대하여 책임을 부담하지 아니합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    2. PG사 결제 시스템 장애로 인한 손해에 대해서는 해당 PG사의 약관에 따라 처리됩니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    3. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    4. 회사는 이용자 간 또는 이용자와 제3자 간 발생한 분쟁에 개입하지 않습니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    5. 회사는 이용자가 제공한 정보의 정확성에 대해 보증하지 않습니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제11조 (재판권 및 준거법)</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    1. 회사와 이용자간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    2. 회사와 이용자간에 제기된 전자상거래 소송에는 한국법을 적용합니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제12조 (서비스 제공 기간)</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    1. 회사는 이용자가 결제한 시점부터 해당 유료 구독기간(1개월, 1년 등) 동안 서비스를 제공합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    2. 서비스 제공은 회원 계정으로 로그인한 순간부터 즉시 개시됩니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    3. 무료 체험기간이 제공되는 경우, 체험기간 종료 후 자동으로 유료 결제 전환이 이루어질 수 있습니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    4. 서비스 제공 기간 중 시스템 점검, 천재지변 등 불가피한 사유로 일시 중단될 수 있으며, 회사는 사전 또는 사후에 공지합니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제13조 (배송에 관한 사항)</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    1. 본 서비스는 디지털 형태의 온라인 콘텐츠로서 별도의 물리적 상품 배송은 이루어지지 않습니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    2. 이용자는 회원가입 및 결제 완료 후 즉시 서비스를 이용할 수 있습니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제14조 (결제 취소 및 환불 정책)</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    1. 이용자가 결제를 완료한 이후, 서비스 특성상 이용이 개시된 경우 환불이 제한될 수 있습니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    2. 단, 다음의 경우에는 전액 환불이 가능합니다.
                  </p>
                  <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• 결제 후 7일 이내에 서비스에 접속하지 않은 경우</li>
                    <li>• 시스템 오류 또는 회사의 귀책사유로 인해 정상적인 이용이 불가능한 경우</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300">
                    3. 부분 환불 또는 잔여 기간 환불은 회사의 정책에 따라 산정됩니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    4. 결제 취소 및 환불 요청은 고객센터(이메일: zipyojeonghelp@gmail.com)를 통해 가능합니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    5. 환불 시 PG사(결제대행사)의 수수료가 발생할 경우, 해당 비용은 이용자가 부담할 수 있습니다.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">제15조 (교환 정책)</h2>
                <div className="space-y-3 ml-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    1. 본 서비스는 무형의 디지털 콘텐츠로, 물리적인 교환 개념이 존재하지 않습니다.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    2. 단, 동일 계정 내 구독 등급 변경(업그레이드/다운그레이드)은 회사의 정책에 따라 가능합니다.
                  </p>
                </div>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">부칙</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  이 약관은 2025년 10월 1일부터 시행됩니다.
                </p>
              </section>

              <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800 dark:text-green-400">
                    집요정 서비스를 이용해 주셔서 감사합니다.
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                  문의사항이 있으시면 zipyojeonghelp@gmail.com으로 연락주세요.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
