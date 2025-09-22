import { doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch, increment, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export type SubscriptionPlan = 'free' | 'starter' | 'basic' | 'standard' | 'pro' | 'proplus' | 'enterprise';

export interface SubscriptionModel {
  plan: SubscriptionPlan;
  expiryDate: Date | null;
  isActive: boolean;
}

export interface PlanDisplayInfo {
  name: string;
  tenantLimit: number;
  hasPremiumAccess: boolean;
}

export class PlanService {
  private static readonly USER_PLANS_COLLECTION = 'user_plans';

  // 플랜별 정보 정의
  static getPlanInfo(plan: SubscriptionPlan): PlanDisplayInfo {
    switch (plan) {
      case 'free':
        return { name: '무료 플랜', tenantLimit: 5, hasPremiumAccess: false };
      case 'starter':
        return { name: '스타터', tenantLimit: 5, hasPremiumAccess: true };
      case 'basic':
        return { name: '베이직', tenantLimit: 10, hasPremiumAccess: true };
      case 'standard':
        return { name: '스탠다드', tenantLimit: 30, hasPremiumAccess: true };
      case 'pro':
        return { name: '프로', tenantLimit: 50, hasPremiumAccess: true };
      case 'proplus':
        return { name: '프로 플러스', tenantLimit: 50, hasPremiumAccess: true }; // 50명 이상 + 추가 가능
      case 'enterprise':
        return { name: '엔터프라이즈', tenantLimit: -1, hasPremiumAccess: true }; // 관리자와 협의 후 지정
      default:
        return { name: '무료 플랜', tenantLimit: 5, hasPremiumAccess: false };
    }
  }

  // 사용자 플랜 조회
  static async getUserPlan(userId: string): Promise<SubscriptionModel> {
    try {
      const docRef = doc(firestore, this.USER_PLANS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          plan: data.plan || 'free',
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          isActive: data.isActive ?? true
        };
      }

      // 플랜이 없으면 무료 플랜으로 생성
      const freePlan: SubscriptionModel = {
        plan: 'free',
        expiryDate: null,
        isActive: true
      };

      await this.setUserPlan(userId, freePlan);
      return freePlan;
    } catch (error) {
      console.error('사용자 플랜 조회 실패:', error);
      return { plan: 'free', expiryDate: null, isActive: true };
    }
  }

  // 사용자 플랜 설정
  static async setUserPlan(userId: string, subscription: SubscriptionModel): Promise<void> {
    try {
      await setDoc(doc(firestore, this.USER_PLANS_COLLECTION, userId), {
        plan: subscription.plan,
        expiryDate: subscription.expiryDate?.toISOString() || null,
        isActive: subscription.isActive
      });
      console.log('사용자 플랜 업데이트 완료:', userId, subscription.plan);
    } catch (error) {
      console.error('사용자 플랜 업데이트 실패:', error);
      throw error;
    }
  }

  // 월간 플랜 할당
  static async assignMonthlyPlan(userId: string, plan: SubscriptionPlan): Promise<void> {
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30일 후
    await this.assignPlanToUser(userId, plan, expiryDate);
  }

  // 연간 플랜 할당
  static async assignYearlyPlan(userId: string, plan: SubscriptionPlan): Promise<void> {
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365일 후
    await this.assignPlanToUser(userId, plan, expiryDate);
  }

  // 플랜 할당
  static async assignPlanToUser(userId: string, plan: SubscriptionPlan, expiryDate: Date | null = null, isActive: boolean = true): Promise<void> {
    try {
      const subscription: SubscriptionModel = {
        plan,
        expiryDate,
        isActive
      };

      await this.setUserPlan(userId, subscription);

      // 플랜 할당 로그 기록
      await this.logPlanAssignment(userId, plan, expiryDate);
    } catch (error) {
      console.error('플랜 할당 실패:', error);
      throw error;
    }
  }

  // 포인트로 플랜 구매
  static async purchasePlanWithPoints(
    userId: string,
    planId: SubscriptionPlan,
    planName: string,
    pointCost: number,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<void> {
    try {
      // 현재 포인트 확인
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('사용자 정보를 찾을 수 없습니다');
      }

      const currentPoints = userDoc.data()?.points || 0;
      if (currentPoints < pointCost) {
        throw new Error('포인트가 부족합니다');
      }

      const duration = billingCycle === 'monthly' ? 30 : 365;
      const expiryDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

      const batch = writeBatch(firestore);

      // 포인트 차감
      const userRef = doc(firestore, 'users', userId);
      batch.update(userRef, {
        points: increment(-pointCost),
        lastPurchaseAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // 플랜 업데이트
      const planRef = doc(firestore, this.USER_PLANS_COLLECTION, userId);
      batch.set(planRef, {
        plan: planId,
        expiryDate: expiryDate.toISOString(),
        isActive: true
      });

      // 구매 기록 저장
      const purchaseLogRef = doc(collection(firestore, 'point_purchases'));
      batch.set(purchaseLogRef, {
        userId: userId,
        planId: planId,
        planName: planName,
        planType: `${planId}_${billingCycle}`,
        pointCost: pointCost,
        duration: duration,
        purchaseDate: Timestamp.now(),
        status: 'completed'
      });

      await batch.commit();
      console.log('포인트 플랜 구매 완료:', { userId, planId, pointCost });
    } catch (error) {
      console.error('포인트 플랜 구매 실패:', error);
      throw error;
    }
  }

  // 플랜 할당 로그 기록
  private static async logPlanAssignment(userId: string, plan: SubscriptionPlan, expiryDate: Date | null): Promise<void> {
    try {
      await setDoc(doc(collection(firestore, 'plan_history')), {
        userId: userId,
        plan: plan,
        expiryDate: expiryDate?.toISOString() || null,
        action: 'assigned',
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('플랜 할당 로그 기록 실패:', error);
    }
  }

  // 만료된 플랜 처리
  static async checkAndHandleExpiredPlans(): Promise<void> {
    try {
      const now = new Date();
      const expiredQuery = query(
        collection(firestore, this.USER_PLANS_COLLECTION),
        where('expiryDate', '<', now.toISOString()),
        where('isActive', '==', true)
      );

      const expiredSnapshot = await getDocs(expiredQuery);

      for (const docSnapshot of expiredSnapshot.docs) {
        const data = docSnapshot.data();
        if (data.expiryDate && new Date(data.expiryDate) < now) {
          // 만료된 플랜을 무료 플랜으로 변경
          await this.setUserPlan(docSnapshot.id, {
            plan: 'free',
            expiryDate: null,
            isActive: true
          });
          console.log('만료된 플랜 처리:', docSnapshot.id);
        }
      }
    } catch (error) {
      console.error('만료된 플랜 처리 실패:', error);
    }
  }
}