'use client';

// admin/plans/page.tsx - 임시 비활성화 버전

export default function AdminPlansPage() {
  return <div></div>;
}

/*
원래 AdminPlansPage 내용 전체를 주석 처리했습니다.
추후 admin 기능을 개발할 때 주석을 해제하고 복원 가능.
*/
      

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; <- 어드민 기능인데 지금 후속 select 파일을 만들다 말았음. 임시 비활성화.
import { PlanService, SubscriptionPlan } from '@/lib/planService';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  UserCog,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Crown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

interface UserPlan {
  userId: string;
  plan: SubscriptionPlan;
  expiryDate: Date | null;
  isActive: boolean;
  userEmail?: string;
  userName?: string;
}

export default function AdminPlansPage() {
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 플랜 부여 폼
  const [grantForm, setGrantForm] = useState({
    userId: '',
    plan: 'starter' as SubscriptionPlan,
    duration: '30',
    unlimited: false
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 모든 사용자 플랜 가져오기
  const loadUserPlans = async () => {
    setLoading(true);
    try {
      const userPlansSnapshot = await getDocs(collection(firestore, 'user_plans'));
      const plans: UserPlan[] = [];

      userPlansSnapshot.forEach((doc) => {
        const data = doc.data();
        plans.push({
          userId: doc.id,
          plan: data.plan || 'free',
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          isActive: data.isActive ?? true,
          userEmail: data.userEmail,
          userName: data.userName
        });
      });

      // 만료일 기준으로 정렬 (만료일이 없는 것은 마지막에)
      plans.sort((a, b) => {
        if (!a.expiryDate && !b.expiryDate) return 0;
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });

      setUserPlans(plans);
    } catch (error) {
      console.error('사용자 플랜 로딩 실패:', error);
      setMessage({ type: 'error', text: '사용자 플랜을 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserPlans();
  }, []);

  // 플랜 부여
  const handleGrantPlan = async () => {
    if (!grantForm.userId.trim()) {
      setMessage({ type: 'error', text: '사용자 ID를 입력해주세요.' });
      return;
    }

    setActionLoading('grant');
    try {
      if (grantForm.unlimited) {
        await PlanService.grantUnlimitedPlan(grantForm.userId, grantForm.plan);
        setMessage({ type: 'success', text: `${grantForm.userId}에게 무제한 ${grantForm.plan} 플랜을 부여했습니다.` });
      } else {
        await PlanService.grantTimedPlan(grantForm.userId, grantForm.plan, parseInt(grantForm.duration));
        setMessage({ type: 'success', text: `${grantForm.userId}에게 ${grantForm.duration}일 ${grantForm.plan} 플랜을 부여했습니다.` });
      }

      setGrantForm({ userId: '', plan: 'starter', duration: '30', unlimited: false });
      await loadUserPlans();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '플랜 부여에 실패했습니다.' });
    } finally {
      setActionLoading(null);
    }
  };

  // 플랜 제거
  const handleRemovePlan = async (userId: string) => {
    if (!confirm('정말 이 사용자의 플랜을 제거하시겠습니까?')) return;

    setActionLoading(userId);
    try {
      await PlanService.removePlanFromUser(userId);
      setMessage({ type: 'success', text: `${userId}의 플랜을 제거했습니다.` });
      await loadUserPlans();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '플랜 제거에 실패했습니다.' });
    } finally {
      setActionLoading(null);
    }
  };

  // 만료된 플랜 일괄 정리
  const handleCleanupExpired = async () => {
    if (!confirm('만료된 모든 플랜을 정리하시겠습니까?')) return;

    setActionLoading('cleanup');
    try {
      await PlanService.checkAndHandleExpiredPlans();
      setMessage({ type: 'success', text: '만료된 플랜을 정리했습니다.' });
      await loadUserPlans();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '플랜 정리에 실패했습니다.' });
    } finally {
      setActionLoading(null);
    }
  };

  const getPlanBadgeColor = (plan: SubscriptionPlan) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      basic: 'bg-green-100 text-green-800',
      standard: 'bg-yellow-100 text-yellow-800',
      pro: 'bg-purple-100 text-purple-800',
      proplus: 'bg-indigo-100 text-indigo-800',
      enterprise: 'bg-red-100 text-red-800'
    };
    return colors[plan] || colors.free;
  };

  const isExpired = (expiryDate: Date | null) => {
    return expiryDate && expiryDate < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-bold">
              <Shield className="w-6 h-6 mr-2 text-blue-600" />
              플랜 관리 (관리자)
            </CardTitle>
          </CardHeader>
        </Card>

        {/* 메시지 */}
        {message && (
          <Card className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                {message.type === 'success' ?
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" /> :
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                }
                <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 플랜 부여 */}
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCog className="w-5 h-5 mr-2" />
              사용자에게 플랜 부여
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="userId">사용자 ID</Label>
                <Input
                  id="userId"
                  value={grantForm.userId}
                  onChange={(e) => setGrantForm({ ...grantForm, userId: e.target.value })}
                  placeholder="Firebase Auth UID"
                />
              </div>

              <div>
                <Label htmlFor="plan">플랜</Label>
                {/* 마찬가지로 select 관련 오류로 임시 비활성화. 추후 활성화 필요.
                <Select value={grantForm.plan} onValueChange={(value: SubscriptionPlan) => setGrantForm({ ...grantForm, plan: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">스타터</SelectItem>
                    <SelectItem value="basic">베이직</SelectItem>
                    <SelectItem value="standard">스탠다드</SelectItem>
                    <SelectItem value="pro">프로</SelectItem>
                    <SelectItem value="proplus">프로 플러스</SelectItem>
                    <SelectItem value="enterprise">엔터프라이즈</SelectItem>
                  </SelectContent>
                </Select>*/}
              </div>

              <div>
                <Label htmlFor="duration">기간 (일)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={grantForm.duration}
                  onChange={(e) => setGrantForm({ ...grantForm, duration: e.target.value })}
                  disabled={grantForm.unlimited}
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleGrantPlan}
                  disabled={actionLoading === 'grant'}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {actionLoading === 'grant' ? '처리중...' : '플랜 부여'}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="unlimited"
                checked={grantForm.unlimited}
                onChange={(e) => setGrantForm({ ...grantForm, unlimited: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="unlimited" className="text-sm">무제한 플랜 (만료일 없음)</Label>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <div className="flex space-x-4">
          <Button
            onClick={() => loadUserPlans()}
            disabled={loading}
            variant="outline"
          >
            새로고침
          </Button>

          <Button
            onClick={handleCleanupExpired}
            disabled={actionLoading === 'cleanup'}
            variant="outline"
          >
            <Clock className="w-4 h-4 mr-2" />
            {actionLoading === 'cleanup' ? '정리중...' : '만료된 플랜 정리'}
          </Button>
        </div>

        {/* 사용자 플랜 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>전체 사용자 플랜 ({userPlans.length}명)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : (
              <div className="space-y-4">
                {userPlans.map((userPlan) => (
                  <div
                    key={userPlan.userId}
                    className={`p-4 border rounded-lg ${isExpired(userPlan.expiryDate) ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{userPlan.userName || '이름 없음'}</span>
                          <span className="text-gray-500 text-sm">({userPlan.userEmail || '이메일 없음'})</span>
                          <Badge className={getPlanBadgeColor(userPlan.plan)}>
                            {PlanService.getPlanInfo(userPlan.plan).name}
                          </Badge>
                          {!userPlan.expiryDate && userPlan.plan !== 'free' && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Crown className="w-3 h-3 mr-1" />
                              무제한
                            </Badge>
                          )}
                          {isExpired(userPlan.expiryDate) && (
                            <Badge className="bg-red-100 text-red-800">만료됨</Badge>
                          )}
                        </div>

                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                          <div>사용자 ID: {userPlan.userId}</div>
                          {userPlan.expiryDate && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              만료일: {userPlan.expiryDate.toLocaleDateString()} {userPlan.expiryDate.toLocaleTimeString()}
                              {isExpired(userPlan.expiryDate) && <span className="ml-2 text-red-600 font-medium">(만료됨)</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleRemovePlan(userPlan.userId)}
                          disabled={actionLoading === userPlan.userId}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {actionLoading === userPlan.userId ? '처리중...' : '제거'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {userPlans.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    등록된 사용자 플랜이 없습니다.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
