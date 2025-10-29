import * as admin from 'firebase-admin';

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
    try {
        // Vercel 환경에서는 환경 변수로 서비스 계정 정보를 제공
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            : {
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zipyojeong-f1e17',
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zipyojeong-f1e17',
        });

        console.log('Firebase Admin SDK 초기화 성공');
    } catch (error) {
        console.error('Firebase Admin SDK 초기화 실패:', error);
        console.warn('Firebase Admin이 올바르게 설정되지 않았습니다.');
    }
}

// Firestore Admin 인스턴스
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;
