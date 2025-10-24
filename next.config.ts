import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    appDir: true, // app 디렉토리 사용
  },
  output: "standalone", // Vercel 배포 시 standalone 모드
};

export default nextConfig;
