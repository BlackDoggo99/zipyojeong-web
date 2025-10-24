/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// functions/index.js
const functions = require("firebase-functions");
const crypto = require("crypto");
const admin = require("firebase-admin");

admin.initializeApp();

exports.inicisPayment = functions.https.onCall(async (data, context) => {
  // 클라이언트에서 전달
  const { price, orderId, goodsName, buyerName } = data;

  // 테스트용 - 실제 운영 환경에서는 functions.config()로 불러오세요.
  const mid = functions.config().inicis?.mid || "INIpayTest";
  const signKey = functions.config().inicis?.signkey || "SU5JTElURV9UUklQTEVERVNfS0VZU1RS";

  const timestamp = Date.now().toString();
  const oid = orderId || `ORDER_${timestamp}`;
  const mKey = crypto.createHash("sha256").update(signKey).digest("hex");

  // 이니시스가 요구하는 signature/verification 방식(샘플에서 사용한 방식 유지)
  const signature = crypto
    .createHash("sha256")
    .update(`oid=${oid}&price=${price}&timestamp=${timestamp}`)
    .digest("hex");

  const verification = crypto
    .createHash("sha256")
    .update(`oid=${oid}&price=${price}&signKey=${signKey}&timestamp=${timestamp}`)
    .digest("hex");

  // (원하면 주문정보/로그를 Firestore에 저장)
  await admin.firestore().collection("payments_temp").doc(oid).set({
    mid, oid, price, goodsName, buyerName, createdAt: admin.firestore.FieldValue.serverTimestamp(), status: "init"
  });

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
    use_chkfake: "Y"
  };
});
