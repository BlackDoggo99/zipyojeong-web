"use client";
import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export default function CheckoutTest() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // KG이니시스 결제 스크립트 로드
    const script = document.createElement("script");
    script.src = "https://stgstdpay.inicis.com/stdjs/INIStdPay.js"; // 테스트용 경로
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    setLoading(true);
    try {
      // Firebase Callable Function 호출
      const createPayment = httpsCallable(functions, "inicisPayment");
      const response = await createPayment({
        price: 1000, // 테스트 금액
        goodsName: "테스트상품",
        buyerName: "홍길동",
      });

      const data = response.data as any;

      // KG이니시스 결제 요청 파라미터 구성
      const payData = {
        mid: data.mid,
        oid: data.oid,
        price: data.price,
        timestamp: data.timestamp,
        signature: data.signature,
        goodname: data.goodsName,
        buyername: data.buyerName,
        gopaymethod: "Card", // 테스트용 카드 결제
        mKey: data.mKey,
        version: "1.0",
        currency: "WON",
        returnUrl: "https://zipyojeong.vercel.app/checkout/complete", // 결제 완료 후 리다이렉트 주소
      };

      // 이니시스 결제창 호출
      if (window.INIStdPay) {
        window.INIStdPay.pay(payData);
      } else {
        alert("이니시스 스크립트 로드 실패");
      }
    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert("결제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-xl font-bold mb-4">KG이니시스 테스트 결제</h1>
      <button
        onClick={handlePay}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "결제 요청 중..." : "결제하기"}
      </button>
    </div>
  );
}
