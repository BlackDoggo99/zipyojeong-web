import * as admin from 'firebase-admin';

// Firebase Admin SDK 초기화 함수
function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.apps[0];
    }

    try {
        console.log('Firebase Admin SDK 초기화 시작...');
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('VERCEL_ENV:', process.env.VERCEL_ENV);

        // 환경 변수 확인 - 에러 발생 전에 반드시 로그 출력
        const hasServiceAccountKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
        const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
        const hasProjectId = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        console.log('=== 환경 변수 상태 ===');
        console.log('FIREBASE_SERVICE_ACCOUNT_KEY:', hasServiceAccountKey ? '있음' : '없음');
        console.log('FIREBASE_CLIENT_EMAIL:', hasClientEmail ? '있음' : '없음');
        console.log('FIREBASE_PRIVATE_KEY:', hasPrivateKey ? '있음' : '없음');
        console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', hasProjectId ? '있음' : '없음');
        console.log('======================');

        let serviceAccount: any;

        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            // 방법 2: 전체 JSON
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                console.log('서비스 계정 JSON 파싱 성공');
            } catch (parseError) {
                console.error('서비스 계정 JSON 파싱 실패:', parseError);
                throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY JSON 파싱 실패');
            }
        } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            // 방법 1: 개별 환경 변수
            serviceAccount = {
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zipyojeong-f1e17',
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };
            console.log('개별 환경 변수로 서비스 계정 구성 완료');
        } else {
            throw new Error('Firebase Admin 환경 변수가 설정되지 않았습니다. FIREBASE_SERVICE_ACCOUNT_KEY 또는 (FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)를 설정해주세요.');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zipyojeong-f1e17',
        });

        console.log('✅ Firebase Admin SDK 초기화 성공');
        return admin.app();
    } catch (error) {
        console.error('❌ Firebase Admin SDK 초기화 실패:', error);
        throw error; // 에러를 던져서 호출하는 쪽에서 처리하도록
    }
}

// 초기화 실행
initializeFirebaseAdmin();

// Firestore Admin 인스턴스 getter 함수
export function getAdminDb() {
    if (admin.apps.length === 0) {
        initializeFirebaseAdmin();
    }
    return admin.firestore();
}

export function getAdminAuth() {
    if (admin.apps.length === 0) {
        initializeFirebaseAdmin();
    }
    return admin.auth();
}

// 기존 호환성을 위한 export (deprecated, getter 함수 사용 권장)
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null as any;
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null as any;

export default admin;
