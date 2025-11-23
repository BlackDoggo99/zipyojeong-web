/**
 * Firebase Admin SDK를 사용하여 특정 사용자에게 관리자 권한을 부여하는 스크립트
 *
 * 사용법:
 * GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccount.json node scripts/set-admin.js
 * 또는 Firebase CLI가 로그인된 상태에서:
 * node scripts/set-admin.js
 */

const admin = require('firebase-admin');

// Firebase Admin SDK 초기화 (환경변수 또는 Application Default Credentials 사용)
try {
  admin.initializeApp({
    projectId: 'zipyojeong-f1e17'
  });
} catch (error) {
  console.error('❌ Firebase Admin SDK 초기화 실패:', error.message);
  console.log('\n💡 해결 방법:');
  console.log('1. Firebase Console에서 서비스 계정 키를 다운로드하세요');
  console.log('2. GOOGLE_APPLICATION_CREDENTIALS 환경변수를 설정하세요');
  console.log('   export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"');
  process.exit(1);
}

const ADMIN_UID = 'yyWcGI3YY0cNUI5drtIJsCfNVfa2';

async function setAdminClaim() {
  try {
    // 사용자 정보 확인
    const user = await admin.auth().getUser(ADMIN_UID);
    console.log(`✅ 사용자 찾음: ${user.email}`);

    // 관리자 커스텀 클레임 설정
    await admin.auth().setCustomUserClaims(ADMIN_UID, { admin: true });
    console.log(`✅ 관리자 권한 부여 완료: ${user.email}`);

    // 확인
    const updatedUser = await admin.auth().getUser(ADMIN_UID);
    console.log('✅ 커스텀 클레임:', updatedUser.customClaims);

    console.log('\n⚠️  중요: 사용자는 다시 로그인해야 새로운 권한이 적용됩니다.');

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

setAdminClaim();
