const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const crypto = require('crypto');
const bodyParser = require("body-parser");
const request = require('request');
const cors = require('cors');
const getUrl = require('./properties');

// Firebase Admin SDK 초기화
admin.initializeApp();
const db = admin.firestore();

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Firebase 환경 변수에서 MID와 SignKey 로드 (1단계 1.2.에서 설정 필요)
const INICIS_CONFIG = functions.config().inicis || { mid: "INIpayTest", signkey: "SU5JTElURV9UUklQTEVERVNfS0VZU1RS" };
const MID = INICIS_CONFIG.mid;
const SIGN_KEY = INICIS_CONFIG.signkey;

// =========================================================================
// 1. 결제 요청 파라미터 생성 API (Next.js 클라이언트가 호출)
// =========================================================================
app.post("/requestPayment", (req, res) => {
    const { amount, planName } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).send({ success: false, msg: "유효하지 않은 금액입니다." });
    }

    const mid = MID;
    const signKey = SIGN_KEY;
    const mKey = crypto.createHash("sha256").update(signKey).digest('hex');
    const oid = `ZIP_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
    const price = amount.toString();
    const timestamp = new Date().getTime();
    const use_chkfake = "Y";

    const signature = crypto.createHash("sha256").update("oid="+oid+"&price="+price+"&timestamp="+timestamp).digest('hex');
    const verification = crypto.createHash("sha256").update("oid="+oid+"&price="+price+"&signKey="+signKey+"&timestamp="+timestamp).digest('hex');

    res.status(200).send({
        success: true,
        mid, oid, price, timestamp, mKey, use_chkfake, signature, verification, planName
    });
});

// =========================================================================
// 2. 결제 승인/결과 처리 Callback API (KG이니시스가 호출)
// =========================================================================
app.post("/inicisCallback", async (req, res) => {

    const BASE_URL = `https://zipyojeong.vercel.app`;

    // 1. 인증 결과 확인 및 실패 시 리다이렉트
    if (req.body.resultCode !== "0000") {
        console.error("인증 실패:", req.body);
        return res.redirect(`${BASE_URL}/checkout/fail?msg=${encodeURIComponent(req.body.resultMsg)}`);
    }

    // 2. 최종 승인 요청 파라미터 준비
    const mid = req.body.mid;
    const signKey = SIGN_KEY;
    const authToken = req.body.authToken;
    const netCancelUrl = req.body.netCancelUrl;
    const merchantData = req.body.merchantData;
    const timestamp = new Date().getTime();
    const charset = "UTF-8";
    const format = "JSON";

    const idc_name = req.body.idc_name;
    const authUrl = req.body.authUrl;
    const authUrl2 = getUrl.getAuthUrl(idc_name);

    // SHA256 Hash값 [대상: authToken, timestamp]
    const signature = crypto.createHash("sha256").update("authToken=" + authToken + "&timestamp=" + timestamp).digest('hex');

    // SHA256 Hash값 [대상: authToken, signKey, timestamp]
    const verification = crypto.createHash("sha256").update("authToken=" + authToken + "&signKey=" + signKey + "&timestamp=" + timestamp).digest('hex');

    // 3. 결제 승인 요청 파라미터
    const options = {
        mid: mid,
        authToken: authToken,
        timestamp: timestamp,
        signature: signature,
        verification: verification,
        charset: charset,
        format: format
    };

    // 4. authUrl 검증 후 최종 승인 요청
    if (authUrl !== authUrl2) {
        console.error("authUrl 불일치:", { authUrl, authUrl2 });
        return res.redirect(`${BASE_URL}/checkout/fail?msg=인증 URL 불일치 오류`);
    }

    // 5. 최종 승인 요청
    request.post({ method: 'POST', uri: authUrl2, form: options, json: true }, (err, httpResponse, body) => {

        if (err || !body || body.resultCode !== "0000") {
            console.error("최종 승인 실패:", err || body);
            const errorMsg = body ? body.resultMsg : "네트워크 오류";

            // 망취소 처리 (예외 발생 시)
            const netCancelUrl2 = getUrl.getNetCancel(idc_name);
            if (netCancelUrl === netCancelUrl2) {
                request.post({ method: 'POST', uri: netCancelUrl2, form: options, json: true }, (cancelErr, cancelResponse, cancelBody) => {
                    console.log("망취소 결과:", cancelErr || cancelBody);
                });
            }

            return res.redirect(`${BASE_URL}/checkout/fail?msg=${encodeURIComponent(errorMsg)}`);
        }

        // 6. 최종 결제 성공 (resultCode === "0000")
        console.log("결제 성공:", body);

        // 7. Firestore에 결제 정보 저장 및 구독권 갱신
        try {
            const paymentData = {
                tid: body.tid,                       // 이니시스 거래 ID
                orderId: body.MOID,                  // 주문번호
                amount: parseInt(body.TotPrice),     // 결제 금액
                payMethod: body.payMethod || 'CARD', // 결제 수단
                status: 'completed',                 // 결제 상태
                cardName: body.cardName || '',       // 카드명
                applDate: body.applDate || '',       // 승인일
                applTime: body.applTime || '',       // 승인시간
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                userId: merchantData || 'unknown',   // TODO: 실제 사용자 ID 연동 필요
                planName: body.goodName || '알 수 없음' // 플랜명
            };

            // payments 컬렉션에 결제 정보 저장
            await db.collection('payments').doc(body.MOID).set(paymentData);

            // TODO: 사용자별 구독권 갱신 로직 추가
            // 예시:
            // if (merchantData && merchantData !== 'unknown') {
            //     const subscriptionData = {
            //         planName: body.goodName,
            //         status: 'active',
            //         startDate: admin.firestore.FieldValue.serverTimestamp(),
            //         // 만료일: 현재 시간 + 30일
            //         endDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            //         lastPaymentId: body.MOID,
            //         amount: parseInt(body.TotPrice)
            //     };
            //
            //     await db.collection('users').doc(merchantData).update({
            //         subscription: subscriptionData
            //     });
            // }

            console.log("Firestore 저장 완료:", body.MOID);
        } catch (firestoreError) {
            console.error("Firestore 저장 실패:", firestoreError);
            // Firestore 저장 실패해도 결제는 완료되었으므로 사용자에게는 성공 페이지 표시
            // 관리자는 로그를 확인하여 수동으로 처리 필요
        }

        return res.redirect(`${BASE_URL}/checkout/complete?oid=${body.MOID}&price=${body.TotPrice}`);
    });
});

exports.paymentApi = functions.https.onRequest(app);