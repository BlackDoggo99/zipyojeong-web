// functions/index.js
const { onCall } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const crypto = require("crypto");
const admin = require("firebase-admin");

// Firebase Admin 초기화 (Firestore 사용 시 필수)
admin.initializeApp();

// 🔐 환경 변수(secrets) 선언
const INICIS_MID = defineSecret("INICIS_MID");
const INICIS_SIGNKEY = defineSecret("INICIS_SIGNKEY");

// 이니시스 결제 준비 함수 (Callable Function)
exports.inicisPayment = onCall(
  { secrets: [INICIS_MID, INICIS_SIGNKEY] },
  async (request) => {
    try {
      const { price, orderId, goodsName, buyerName } = request.data;

      // 1. 🚨 필수 수정: price를 문자열로 변환하여 priceString 선언
      const priceString = String(price);

      // secrets 값 불러오기
      const mid = INICIS_MID.value();
      const signKey = INICIS_SIGNKEY.value();

      const timestamp = Date.now().toString();
      const oid = orderId || `ORDER_${timestamp}`;
      const mKey = crypto.createHash("sha256").update(signKey).digest("hex"); // mKey는 서버에서만 사용

      // 이니시스에서 요구하는 signature / verification 계산
      // 2. signature 계산 시 priceString 사용
      const signature = crypto
          .createHash("sha256")
          .update(`oid=${oid}&price=${priceString}&timestamp=${timestamp}`)
          .digest("hex");

      // 3. verification 계산 시에도 priceString 사용 (일관성 및 정확성 확보)
      const verification = crypto
        .createHash("sha256")
        .update(`oid=${oid}&price=${priceString}&signKey=${signKey}&timestamp=${timestamp}`)
        .digest("hex");

      // Firestore에 임시 결제 데이터 저장
      // 4. Firestore 저장 시 priceString (문자열) 사용
      await admin.firestore().collection("payments_temp").doc(oid).set({
        mid,
        oid,
        price: priceString, // 문자열로 저장
        goodsName,
        buyerName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "init",
      });

      logger.info(`이니시스 결제 준비 완료: ${oid}`);

      // 클라이언트로 반환
      // 5. 클라이언트로 반환 시 priceString (문자열) 사용
      return {
        mid,
        oid,
        price: priceString, // ⬅️ 문자열로 반환
        timestamp,
        signature,
        goodsName,
        buyerName,
        use_chkfake: "Y",
      };
    } catch (error) {
      logger.error("inicisPayment 함수 오류:", error);
      throw new Error("이니시스 결제 준비 중 오류가 발생했습니다.");
    }
  }
);