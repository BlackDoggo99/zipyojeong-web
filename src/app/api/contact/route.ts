import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, company, inquiryType, message } = await request.json();

    // 필수 필드 검증
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // Resend API 키 확인
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: '이메일 서비스가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 관리자에게 이메일 전송
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend 기본 발신 주소 (나중에 도메인 인증 후 변경 가능)
      to: 'zipyojeonghelp@gmail.com',
      subject: `[집요정 문의] ${inquiryType} - ${name}님으로부터`,
      html: `
        <h2>새로운 문의가 접수되었습니다</h2>
        <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h3>문의 정보</h3>
          <p><strong>문의 유형:</strong> ${inquiryType}</p>
          <p><strong>이름:</strong> ${name}</p>
          <p><strong>이메일:</strong> ${email}</p>
          <p><strong>전화번호:</strong> ${phone || '미제공'}</p>
          <p><strong>회사명:</strong> ${company || '미제공'}</p>

          <h3>문의 내용</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
            ${message.replace(/\n/g, '<br>')}
          </div>

          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            접수 시간: ${new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})}
          </p>
        </div>
      `,
    });

    // 사용자에게 자동 응답 이메일 전송
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: '[집요정] 문의가 정상적으로 접수되었습니다',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #4F46E5;">
            <h1 style="color: #4F46E5; margin: 0;">집요정</h1>
          </div>

          <div style="padding: 30px 20px;">
            <h2 style="color: #333;">안녕하세요, ${name}님!</h2>

            <p>집요정에 문의해 주셔서 감사합니다.<br>
            고객님의 소중한 문의가 정상적으로 접수되었습니다.</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4F46E5;">접수된 문의 내역</h3>
              <p><strong>문의 유형:</strong> ${inquiryType}</p>
              <p><strong>접수 시간:</strong> ${new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})}</p>
            </div>

            <div style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>문의 내용:</strong><br>
              ${message.replace(/\n/g, '<br>')}
            </div>

            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin-top: 0;">📧 답변 안내</h4>
              <p style="margin-bottom: 0;">영업일 기준 2일 이내에 답변드리겠습니다.<br>
              급한 문의사항은 카카오톡으로 연락해 주세요.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://open.kakao.com/me/zipyojeonghelp"
                 style="display: inline-block; background-color: #FEE500; color: #000;
                        padding: 12px 24px; text-decoration: none; border-radius: 6px;
                        font-weight: bold;">
                📱 카카오톡 상담하기
              </a>
            </div>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              집요정 고객센터 | zipyojeonghelp@gmail.com
            </p>
          </div>
        </div>
      `,
    });

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 전송되었습니다.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: '문의 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}