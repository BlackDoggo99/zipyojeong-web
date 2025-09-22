'use client';

// 자동 배포 테스트용 주석

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X, Stars, ShoppingBag, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const { getUserPoints, signOut } = useAuth();

  // 메뉴가 열릴 때 스크롤 방지
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // 인증 상태 확인 및 포인트 로드
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      if (user && getUserPoints) {
        const points = await getUserPoints();
        setUserPoints(points);
      } else {
        setUserPoints(0);
      }
    });

    return () => unsubscribe();
  }, [getUserPoints]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <>
      <header className="border-b bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* 모바일: 햄버거 메뉴 + 로고 */}
            <div className="flex items-center space-x-3 md:space-x-0">
              {/* 모바일 메뉴 버튼 (왼쪽) */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* 로고 (로그인 상태에 따라 다른 페이지로) */}
              <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">집요정</span>
              </Link>
            </div>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden md:flex items-center space-x-8">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/#features"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    기능
                  </Link>
                  <Link
                    href="/pricing"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    요금제
                  </Link>
                  <Link
                    href="/contact"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    문의
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/points-shop"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center"
                  >
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    포인트 상점
                  </Link>
                </>
              )}
            </nav>

            {/* CTA 버튼들 (데스크톱) */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  {/* 포인트 표시 */}
                  <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                    <Stars className="h-4 w-4 mr-1" />
                    {userPoints.toLocaleString()}P
                  </div>
                  <ThemeToggle />
                  <Button variant="ghost" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link href="/login">
                    <Button variant="ghost">로그인</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>무료로 시작하기</Button>
                  </Link>
                </>
              )}
            </div>

            {/* 모바일 테마 토글 (오른쪽) */}
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 슬라이드 메뉴 (왼쪽에서 나옴) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* 배경 오버레이 */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* 슬라이드 메뉴 */}
        <div
          className={`absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-950 shadow-xl transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* 메뉴 헤더 */}
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
            <Link href={isAuthenticated ? "/dashboard" : "/"} onClick={() => setIsMenuOpen(false)}>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">집요정</span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* 메뉴 아이템들 */}
          <div className="flex flex-col p-4">
            {isAuthenticated && (
              <>
                {/* 포인트 표시 */}
                <div className="mb-4 pb-4 border-b dark:border-gray-800">
                  <div className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg">
                    <Stars className="h-5 w-5 mr-2" />
                    <span className="font-semibold">{userPoints.toLocaleString()}P</span>
                  </div>
                </div>

                <Link
                  href="/points-shop"
                  className="py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  포인트 상점
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link
                  href="/#features"
                  className="py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  기능
                </Link>
                <Link
                  href="/pricing"
                  className="py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  요금제
                </Link>
              </>
            )}

            <Link
              href="/contact"
              className="py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              문의하기
            </Link>

            {!isAuthenticated && (
              <Link
                href="/#download"
                className="py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                앱 다운로드
              </Link>
            )}

            {/* 구분선 */}
            <div className="border-t dark:border-gray-800 my-4" />

            {isAuthenticated ? (
              <Button variant="ghost" className="w-full justify-start" onClick={() => {
                handleSignOut();
                setIsMenuOpen(false);
              }}>
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full mb-2">로그인</Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">무료로 시작하기</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}