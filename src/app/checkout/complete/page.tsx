import { Suspense } from "react";
// 1단계에서 분리한 클라이언트 컴포넌트를 가져옵니다.
import CompleteDetails from "./CompleteDetails"; 

// 이 파일은 서버 컴포넌트입니다.
// "use client" 지시어를 제거하고, Suspense를 import합니다.

// Next.js 빌드 시점에 정적 렌더링을 방지하고 요청 시 렌더링하도록 합니다.
// 'useSearchParams' 사용으로 이미 동적 렌더링이 강제되지만, 명시적으로 유지할 수 있습니다.
export const dynamic = "force-dynamic";

export default function CheckoutCompletePage() {
  return (
    // 💡 핵심 해결책: useSearchParams를 사용하는 컴포넌트를 <Suspense>로 감싸줍니다.
    // 이는 서버 측 프리렌더링 시 발생하는 오류를 방지하고, 
    // 클라이언트 측에서 훅이 실행될 때까지 기다리도록 합니다.
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <h1 className="text-2xl font-bold mb-4">결제 완료 페이지</h1>
        <p className="text-gray-700 mb-4">결제 정보를 로드하고 있습니다...</p>
      </div>
    }>
      <CompleteDetails />
    </Suspense>
  );
}