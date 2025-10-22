/*'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanService } from '@/lib/planService';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function MigratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigration = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      await PlanService.migrateUserPlansData();
      setResult('마이그레이션이 성공적으로 완료되었습니다!');
    } catch (err: any) {
      setError(err.message || '마이그레이션 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              사용자 플랜 데이터 마이그레이션
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">이 작업은 기존 user_plans 컬렉션에 사용자 정보를 추가합니다:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>userEmail (사용자 이메일)</li>
                <li>userName (사용자 이름)</li>
                <li>createdAt (생성일시)</li>
                <li>updatedAt (수정일시)</li>
              </ul>
              <p className="mt-4 text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ 이미 정보가 있는 사용자는 건너뛰므로 안전합니다.
              </p>
            </div>

            <Button
              onClick={handleMigration}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  마이그레이션 실행 중...
                </>
              ) : (
                '마이그레이션 실행'
              )}
            </Button>

            {result && (
              <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800 dark:text-green-200">{result}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              마이그레이션 완료 후 이 페이지는 삭제해도 됩니다.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
*/
