import { doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch, increment, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { User } from 'firebase/auth';

export type SubscriptionPlan = 'free' | 'starter' | 'basic' | 'standard' | 'pro' | 'proplus' | 'enterprise' | 'admin';

export interface SubscriptionModel {
  plan: SubscriptionPlan;
  expiryDate: Date | null;
  isActive: boolean;
  userEmail?: string;
  userName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FirestoreSubscription {
  plan: SubscriptionPlan;
  expiryDate: string | null;
  isActive: boolean;
  userEmail?: string;
  userName?: string;
  createdAt?: Timestamp;
  updatedAt: Timestamp;
}

export interface PlanDisplayInfo {
  name: string;
  tenantLimit: number;
  hasPremiumAccess: boolean;
}

export class PlanService {
  private static readonly USER_PLANS_COLLECTION = 'user_plans';

  // 사용자 정보 가져오기 (Users 컬렉션에서)
  private static async getUserInfo(userId: string): Promise<{ email?: string; name?: string }> {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          email: userData.email,
          name: userData.name || userData.displayName
        };
      }
      return {};
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      return {};
    }
  }

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
      case 'admin':
        return { name: '관리자', tenantLimit: -1, hasPremiumAccess: true };
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
        let expiryDate: Date | null = null;
        if (data.expiryDate) {
          if (typeof data.expiryDate === 'string') {
            // 1. ISO 문자열로 저장된 경우 (현재 setUserPlan에서 사용)
            expiryDate = new Date(data.expiryDate);
          } else if (data.expiryDate.toDate) {
            // 2. Firestore Timestamp로 저장된 경우 (과거 데이터 또는 다른 로직에서 사용)
            expiryDate = data.expiryDate.toDate();
          } else if (data.expiryDate instanceof Date) {
            // 3. 이미 Date 객체인 경우 (안전성 확보)
            expiryDate = data.expiryDate;
          }
        }
        return {
          plan: data.plan || 'free',
          // expiryDate: data.expiryDate ? new Date(data.expiryDate) : null, //  기존 코드 삭제
          expiryDate: expiryDate, //  수정된 변수로 대체
          isActive: data.isActive ?? true
        };
      }

      // 플랜이 없으면 무료 플랜으로 생성
      return { plan: 'free', expiryDate: null, isActive: true };
      
      /* // ⚠️⚠️⚠️ 기존에 무료 플랜을 Firestore에 저장하던 로직은 제거하는 것을 권장합니다.
      const userInfo = await this.getUserInfo(userId);
      const freePlan: SubscriptionModel = {
        plan: 'free',
        expiryDate: null,
        isActive: true,
        userEmail: userInfo.email,
        userName: userInfo.name,
        createdAt: new Date()
      };
      await this.setUserPlan(userId, freePlan);
      return freePlan;
      */
    } catch (error) {
      console.error('사용자 플랜 조회 실패:', error);
      return { plan: 'free', expiryDate: null, isActive: true };
    }
  }

  // 사용자 플랜 설정
  static async setUserPlan(userId: string, subscription: SubscriptionModel): Promise<void> {
    try {
      const updateData: FirestoreSubscription = {
      plan: subscription.plan,
      expiryDate: subscription.expiryDate?.toISOString() || null,
      isActive: subscription.isActive,
      updatedAt: Timestamp.now()
    };

      // 사용자 정보가 있으면 추가
      if (subscription.userEmail) updateData.userEmail = subscription.userEmail;
      if (subscription.userName) updateData.userName = subscription.userName;
      if (subscription.createdAt) updateData.createdAt = Timestamp.fromDate(subscription.createdAt);

      await setDoc(doc(firestore, this.USER_PLANS_COLLECTION, userId), updateData, { merge: true });
      console.log('사용자 플랜 업데이트 완료:', userId, subscription.plan);
    } catch (error) {
      console.error('사용자 플랜 업데이트 실패:', error);
      throw error;
    }
  }

  // 월간 플랜 할당 (기간 연장 지원)
  static async assignMonthlyPlan(userId: string, plan: SubscriptionPlan, extendExisting: boolean = false): Promise<void> {
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30일 후
    await this.assignPlanToUser(userId, plan, expiryDate, true, extendExisting);
  }

  // 연간 플랜 할당 (기간 연장 지원)
  static async assignYearlyPlan(userId: string, plan: SubscriptionPlan, extendExisting: boolean = false): Promise<void> {
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365일 후
    await this.assignPlanToUser(userId, plan, expiryDate, true, extendExisting);
  }

  // 플랜 할당 (기간 연장 지원)
  static async assignPlanToUser(userId: string, plan: SubscriptionPlan, expiryDate: Date | null = null, isActive: boolean = true, extendExisting: boolean = false): Promise<void> {
    try {
      const userInfo = await this.getUserInfo(userId);
      let finalExpiryDate = expiryDate;

      // 기간 연장 옵션이 활성화된 경우
      if (extendExisting && expiryDate) {
        const currentPlan = await this.getUserPlan(userId);
        if (currentPlan.expiryDate && currentPlan.expiryDate > new Date()) {
          // 현재 만료일이 미래인 경우, 현재 만료일에 새 기간을 추가
          const extensionDays = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          finalExpiryDate = new Date(currentPlan.expiryDate.getTime() + (extensionDays * 24 * 60 * 60 * 1000));
        }
      }

      const subscription: SubscriptionModel = {
        plan,
        expiryDate: finalExpiryDate,
        isActive,
        userEmail: userInfo.email,
        userName: userInfo.name,
        createdAt: new Date()
      };

      await this.setUserPlan(userId, subscription);

      // 플랜 할당 로그 기록
      await this.logPlanAssignment(userId, plan, finalExpiryDate);
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

      // 사용자 정보 가져오기
      const userInfo = await this.getUserInfo(userId);

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
        isActive: true,
        userEmail: userInfo.email,
        userName: userInfo.name,
        updatedAt: Timestamp.now()
      }, { merge: true });

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

  // 기존 사용자 플랜 데이터 마이그레이션 (한 번만 실행)
  static async migrateUserPlansData(): Promise<void> {
    try {
      console.log('사용자 플랜 데이터 마이그레이션 시작...');

      // 모든 user_plans 문서 가져오기
      const userPlansSnapshot = await getDocs(collection(firestore, this.USER_PLANS_COLLECTION));

      const batch = writeBatch(firestore);
      let updateCount = 0;

      for (const docSnapshot of userPlansSnapshot.docs) {
        const userId = docSnapshot.id;
        const planData = docSnapshot.data();

        // 이미 사용자 정보가 있으면 스킵
        if (planData.userEmail || planData.userName) {
          continue;
        }

        // 사용자 정보 가져오기
        const userInfo = await this.getUserInfo(userId);

        if (userInfo.email || userInfo.name) {
          const updateData: Partial<FirestoreSubscription> = {
            updatedAt: Timestamp.now()
          };

          if (userInfo.email) updateData.userEmail = userInfo.email;
          if (userInfo.name) updateData.userName = userInfo.name;
          if (!planData.createdAt) updateData.createdAt = Timestamp.now();

          batch.update(doc(firestore, this.USER_PLANS_COLLECTION, userId), updateData);
          updateCount++;
        }
      }

      if (updateCount > 0) {
        await batch.commit();
        console.log(`마이그레이션 완료: ${updateCount}개 사용자 플랜 업데이트됨`);
      } else {
        console.log('마이그레이션할 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('사용자 플랜 데이터 마이그레이션 실패:', error);
      throw error;
    }
  }

  // PG 결제 성공 후 플랜 적용 (기간 연장 지원)
  static async processPGPayment(
    userId: string,
    plan: SubscriptionPlan,
    billingCycle: 'monthly' | 'yearly',
    paymentData: {
      paymentId: string;
      amount: number;
      paymentMethod: string;
    }
  ): Promise<void> {
    try {
      const duration = billingCycle === 'monthly' ? 30 : 365;
      const currentPlan = await this.getUserPlan(userId);
      const userInfo = await this.getUserInfo(userId);

      let expiryDate: Date;
      let extendExisting = false;

      // 현재 같은 플랜이고 만료일이 미래인 경우 기간 연장
      if (currentPlan.plan === plan && currentPlan.expiryDate && currentPlan.expiryDate > new Date()) {
        expiryDate = new Date(currentPlan.expiryDate.getTime() + (duration * 24 * 60 * 60 * 1000));
        extendExisting = true;
      } else {
        // 신규 구매 또는 다른 플랜으로 변경
        expiryDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
      }

      const batch = writeBatch(firestore);

      // 플랜 업데이트
      const planRef = doc(firestore, this.USER_PLANS_COLLECTION, userId);
      batch.set(planRef, {
        plan: plan,
        expiryDate: expiryDate.toISOString(),
        isActive: true,
        userEmail: userInfo.email,
        userName: userInfo.name,
        updatedAt: Timestamp.now()
      }, { merge: true });

      // 결제 기록 저장
      const paymentLogRef = doc(collection(firestore, 'payment_logs'));
      batch.set(paymentLogRef, {
        userId: userId,
        planId: plan,
        billingCycle: billingCycle,
        paymentId: paymentData.paymentId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        duration: duration,
        expiryDate: expiryDate.toISOString(),
        extendedExisting: extendExisting,
        paymentDate: Timestamp.now(),
        status: 'completed'
      });

      await batch.commit();
      console.log('PG 결제 처리 완료:', { userId, plan, billingCycle, extendExisting });
    } catch (error) {
      console.error('PG 결제 처리 실패:', error);
      throw error;
    }
  }

  // 관리자용: 사용자 플랜 제거/비활성화
  static async removePlanFromUser(userId: string): Promise<void> {
    try {
      await this.setUserPlan(userId, {
        plan: 'free',
        expiryDate: null,
        isActive: true
      });

      // 플랜 제거 로그 기록
      await setDoc(doc(collection(firestore, 'plan_history')), {
        userId: userId,
        plan: 'free',
        expiryDate: null,
        action: 'removed_by_admin',
        createdAt: Timestamp.now()
      });

      console.log('관리자에 의한 플랜 제거:', userId);
    } catch (error) {
      console.error('플랜 제거 실패:', error);
      throw error;
    }
  }

  // 관리자용: 사용자에게 무제한 플랜 부여
  static async grantUnlimitedPlan(userId: string, plan: SubscriptionPlan): Promise<void> {
    try {
      const userInfo = await this.getUserInfo(userId);

      await this.setUserPlan(userId, {
        plan: plan,
        expiryDate: null, // 무제한
        isActive: true,
        userEmail: userInfo.email,
        userName: userInfo.name
      });

      // 무제한 플랜 부여 로그 기록
      await setDoc(doc(collection(firestore, 'plan_history')), {
        userId: userId,
        plan: plan,
        expiryDate: null,
        action: 'unlimited_granted_by_admin',
        createdAt: Timestamp.now()
      });

      console.log('관리자에 의한 무제한 플랜 부여:', { userId, plan });
    } catch (error) {
      console.error('무제한 플랜 부여 실패:', error);
      throw error;
    }
  }

  // 관리자용: 사용자에게 특정 기간 플랜 부여
  static async grantTimedPlan(userId: string, plan: SubscriptionPlan, days: number): Promise<void> {
    try {
      const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      const userInfo = await this.getUserInfo(userId);

      await this.setUserPlan(userId, {
        plan: plan,
        expiryDate: expiryDate,
        isActive: true,
        userEmail: userInfo.email,
        userName: userInfo.name
      });

      // 관리자 플랜 부여 로그 기록
      await setDoc(doc(collection(firestore, 'plan_history')), {
        userId: userId,
        plan: plan,
        expiryDate: expiryDate.toISOString(),
        duration: days,
        action: 'granted_by_admin',
        createdAt: Timestamp.now()
      });

      console.log('관리자에 의한 기간 플랜 부여:', { userId, plan, days });
    } catch (error) {
      console.error('기간 플랜 부여 실패:', error);
      throw error;
    }
  }

  // 자동 만료 처리를 위한 클라이언트 사이드 체크
  static async checkUserPlanExpiry(userId: string): Promise<boolean> {
    try {
      const userPlan = await this.getUserPlan(userId);

      if (userPlan.expiryDate && userPlan.expiryDate < new Date() && userPlan.isActive) {
        // 만료된 플랜을 무료 플랜으로 변경
        await this.setUserPlan(userId, {
          plan: 'free',
          expiryDate: null,
          isActive: true
        });

        console.log('클라이언트에서 만료된 플랜 처리:', userId);
        return true; // 만료 처리됨
      }

      return false; // 만료되지 않음
    } catch (error) {
      console.error('사용자 플랜 만료 체크 실패:', error);
      return false;
    }
  }
}
