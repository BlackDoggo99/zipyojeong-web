"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export default function CheckoutCompletePage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("결제 결과를 확인 중입니다...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resultCode = searchParams.get("resultCode");
    const resultMsg = searchParams.get("resultMsg");
    const tid = searchParams.get("tid");
    const orderId = searchParams.get("oid") || searchParams.get("orderId");
    const price = searchParams.get("price");

    if (!resultCode || !tid || !orderId) {
      setMessage("잘못된 접근이거나 결제 데이터가 없습니다.");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        if (resultCode === "0000") {
          setMessage("결제 승인 중...");
          const verifyFunc = httpsCallable(functions, "inicisPayment");
          const response = await verifyFunc({
            orderId,
            tid,
            price: parseInt(price || "0"),
            goodsName: searchParams.get("goodname") || "상품명 없음",
            buyerName: searchParams.get("buyername") || "익명",
          });

          const data = response.data;
          console.log("결제 승인 결과:", data);
          setMessage(`✅ 결제가 완료되었습니다! 주문번호: ${orderId}`);
        } else {
          setMessage(`❌ 결제 실패: ${resultMsg || "알 수 없는 오류"}`);
        }
      } catch (err) {
        console.error("결제 승인 실패:", err);
        setMessage("결제 승인 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">결제 완료 페이지</h1>
      <p className="text-gray-700 mb-4">{message}</p>
      {!loading && (
        <a
          href="/"
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          홈으로 돌아가기
        </a>
      )}
    </div>
  );
}
