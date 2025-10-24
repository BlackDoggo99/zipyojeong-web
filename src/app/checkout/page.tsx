"use client";

import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase"; // firebase 초기화 코드
import { useState } from "react";

export default function CheckoutTest() {
  const [data, setData] = useState(null);

  const handleTestPayment = async () => {
    const paymentFn = httpsCallable(functions, "inicisPayment");
    try {
      const result = await paymentFn({
        price: 1000,
        orderId: `TEST_${Date.now()}`,
        goodsName: "테스트상품",
        buyerName: "홍길동"
      });
      console.log("Payment Data:", result.data);
      setData(result.data);
      alert("Firebase function 호출 성공! 콘솔 확인");
    } catch (err) {
      console.error(err);
      alert("오류 발생. 콘솔 확인");
    }
  };

  return (
    <div className="p-10 text-center">
      <button
        onClick={handleTestPayment}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        결제 요청 테스트
      </button>
      {data && (
        <pre className="mt-4 text-left bg-gray-100 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
