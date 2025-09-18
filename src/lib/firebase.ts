import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// TODO: Firebase Console에서 실제 API 키를 받아서 설정해야 합니다
// 1. https://console.firebase.google.com/ 접속
// 2. zipyojeong-f1e17 프로젝트 선택 (없으면 생성)
// 3. 프로젝트 설정 > 일반 > 웹 앱 추가
// 4. 생성된 설정 값을 아래에 입력

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'zipyojeong-f1e17.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zipyojeong-f1e17',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'zipyojeong-f1e17.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxxxx',
};

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

try {
  // Firebase 앱 초기화
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
  console.warn('Firebase가 올바르게 설정되지 않았습니다. 로컬 모드로 실행됩니다.');
  // Create dummy instances to prevent undefined errors
  app = {} as FirebaseApp;
  auth = {} as Auth;
  firestore = {} as Firestore;
}

// Firebase 서비스 내보내기
export { auth, firestore };
export default app;