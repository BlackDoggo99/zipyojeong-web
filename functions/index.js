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

      // secrets 값 불러오기
      const mid = INICIS_MID.value();
      const signKey = INICIS_SIGNKEY.value();

      const timestamp = Date.now().toString();
      const oid = orderId || `ORDER_${timestamp}`;
      const mKey = crypto.createHash("sha256").update(signKey).digest("hex");

      // 이니시스에서 요구하는 signature / verification 계산
      const signature = crypto
        .createHash("sha256")
        .update(`oid=${oid}&price=${price}&timestamp=${timestamp}`)
        .digest("hex");

      const verification = crypto
        .createHash("sha256")
        .update(`oid=${oid}&price=${price}&signKey=${signKey}&timestamp=${timestamp}`)
        .digest("hex");

      // Firestore에 임시 결제 데이터 저장
      await admin.firestore().collection("payments_temp").doc(oid).set({
        mid,
        oid,
        price,
        goodsName,
        buyerName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "init",
      });

      logger.info(`이니시스 결제 준비 완료: ${oid}`);

      // 클라이언트로 반환
      return {
        mid,
        oid,
        price,
        timestamp,
        mKey,
        signature,
        verification,
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
