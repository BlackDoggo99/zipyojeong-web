// Firestore에서 사용자 구독 정보 가져오기
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export interface SubscriptionInfo {
    planName: string;
    planLevel: number;
    status: 'active' | 'expired' | 'cancelled';
    startDate: Date;
    endDate: Date;
    amount: number;
}

/**
 * 현재 로그인한 사용자의 구독 정보를 Firestore에서 가져옵니다.
 */
export async function getUserSubscription(): Promise<SubscriptionInfo | null> {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            console.log('로그인된 사용자가 없습니다.');
            return null;
        }

        const db = getFirestore();
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            console.log('사용자 문서가 존재하지 않습니다.');
            return null;
        }

        const subscription = userDoc.data()?.subscription;

        if (!subscription) {
            console.log('구독 정보가 없습니다.');
            return null;
        }

        return {
            planName: subscription.planName || '',
            planLevel: subscription.planLevel || 0,
            status: subscription.status || 'expired',
            startDate: subscription.startDate?.toDate() || new Date(),
            endDate: subscription.endDate?.toDate() || new Date(),
            amount: subscription.amount || 0
        };
    } catch (error) {
        console.error('구독 정보 가져오기 실패:', error);
        return null;
    }
}

/**
 * 현재 사용자의 플랜 레벨을 반환합니다.
 */
export async function getCurrentPlanLevelFromFirestore(): Promise<number | null> {
    const subscription = await getUserSubscription();
    return subscription?.planLevel || null;
}
