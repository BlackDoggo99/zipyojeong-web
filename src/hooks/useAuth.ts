'use client';

import { useState, useEffect } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, where, collection, getDocs, Timestamp, increment, writeBatch } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { PlanService, SubscriptionModel, SubscriptionPlan } from '@/lib/planService';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  createdAt: Date;
  address?: {
    postcode: string;
    address: string;
    detailAddress: string;
    fullAddress: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPlan, setUserPlan] = useState<SubscriptionModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // 사용자 프로필 가져오기
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const profile: UserProfile = {
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          } as UserProfile;
          setUserProfile(profile);
        }

        // 사용자 플랜 가져오기
        const userPlan = await PlanService.getUserPlan(user.uid);
        setUserPlan(userPlan);
      } else {
        setUserProfile(null);
        setUserPlan(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 추천인 코드 처리 함수
  const processReferralCode = async (referralCode: string, newUserId: string) => {
    try {
      // 추천인 찾기
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('referralCode', '==', referralCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('유효하지 않은 추천인 코드입니다');
      }

      const referrerDoc = querySnapshot.docs[0];
      const referrerId = referrerDoc.id;

      // 자기 자신을 추천할 수 없음
      if (referrerId === newUserId) {
        throw new Error('본인의 추천인 코드는 사용할 수 없습니다');
      }

      // 이미 추천인이 있는지 확인
      const newUserDoc = await getDoc(doc(firestore, 'users', newUserId));
      if (newUserDoc.exists() && newUserDoc.data()?.referredBy) {
        throw new Error('이미 추천인이 등록된 계정입니다');
      }

      // 배치 작업으로 모든 처리를 한 번에
      const batch = writeBatch(firestore);

      // 추천인에게 5000P 지급
      const referrerRef = doc(firestore, 'users', referrerId);
      batch.update(referrerRef, {
        points: increment(5000),
        lastRewardAt: Timestamp.now(),
      });

      // 추천 기록 저장
      const referralLogRef = doc(collection(firestore, 'referral_logs'));
      batch.set(referralLogRef, {
        referrerId: referrerId,
        newUserId: newUserId,
        rewardPoints: 5000,
        createdAt: Timestamp.now(),
        status: 'completed',
      });

      // 신규 사용자에게 추천인 정보 저장
      const newUserRef = doc(firestore, 'users', newUserId);
      batch.update(newUserRef, {
        referredBy: referrerId,
        referralRewardGiven: true,
      });

      await batch.commit();

      // 신규 사용자에게 1개월 무료 스타터 플랜 제공
      await PlanService.assignMonthlyPlan(newUserId, 'starter');

      console.log('추천인 코드 처리 완료:', { referrerId, newUserId, referralCode });
    } catch (error) {
      console.error('추천인 코드 처리 중 오류:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, address: {
    postcode: string;
    address: string;
    detailAddress: string;
    fullAddress: string;
  }, referralCode?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 사용자 프로필 생성
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name,
        createdAt: new Date(),
        address,
      };

      // Firestore에 저장할 때는 Timestamp 사용
      const firestoreProfile = {
        ...profile,
        createdAt: Timestamp.now(),
        points: 0,
        referralCode: user.uid.substring(0, 7).toUpperCase(),
      };

      await setDoc(doc(firestore, 'users', user.uid), firestoreProfile);

      // 추천인 코드 처리
      if (referralCode && referralCode.trim()) {
        try {
          await processReferralCode(referralCode.trim(), user.uid);
        } catch (error) {
          console.warn('추천인 코드 처리 실패:', error);
          // 추천인 코드 처리 실패해도 회원가입은 진행
        }
      }

      setUserProfile(profile);

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };

  const getUserPoints = async () => {
    if (!user) return 0;

    try {
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data()?.points || 0;
      }
      return 0;
    } catch (error) {
      console.error('포인트 조회 실패:', error);
      return 0;
    }
  };

  const purchasePlanWithPoints = async (planId: SubscriptionPlan, planName: string, pointCost: number, billingCycle: 'monthly' | 'yearly') => {
    if (!user) throw new Error('사용자가 로그인되지 않았습니다');

    try {
      await PlanService.purchasePlanWithPoints(user.uid, planId, planName, pointCost, billingCycle);

      // 플랜 정보 새로고침
      const updatedPlan = await PlanService.getUserPlan(user.uid);
      setUserPlan(updatedPlan);

    } catch (error) {
      console.error('플랜 구매 실패:', error);
      throw error;
    }
  };

  return {
    user,
    userProfile,
    userPlan,
    loading,
    signUp,
    signIn,
    signOut,
    getUserPoints,
    purchasePlanWithPoints,
  };
}