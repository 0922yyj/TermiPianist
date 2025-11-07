/** @type {import('next').NextConfig} */

const DEFAULT_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;

const nextConfig = {
  // reactStrictMode: false,
  output: 'standalone',
  // 配置应用的基础路径前缀 - 类似于webpack的publicPath
  basePath: process.env.NODE_ENV === 'development' ? '' : DEFAULT_BASE_PATH,
  // 静态资源CDN前缀配置 - 用于CDN部署
  assetPrefix: process.env.NODE_ENV === 'development' ? '' : DEFAULT_BASE_PATH,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true, // 保留与 React 18 兼容的实验功能
  },
  // 环境变量配置
  env: {
    NEXT_PUBLIC_BASE_URL: DEFAULT_BASE_PATH,
    NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
  },

  async rewrites() {
    console.log(`🌍 NEXT_PUBLIC_IP: ${process.env.NEXT_PUBLIC_IP}`);

    if (process.env.NODE_ENV === 'development') {
      const rewrites = [
        {
          source: '/services/:path*',
          destination: `http://${process.env.NEXT_PUBLIC_IP}/services/:path*`,
        },
        {
          source: '/api/chat',
          destination: 'http://192.168.100.67:8000/chat', // 代理SSE聊天接口
        },
        {
          source: '/api/:path*',
          destination: `http://${process.env.NEXT_PUBLIC_IP}/services/aiscan-service/:path*`,
        },
        {
          source: '/admin/:path*',
          destination: `http://${process.env.NEXT_PUBLIC_IP}/services/aiscan-service/admin/:path*`,
        },
      ];
      return rewrites;
    } else {
      return [];
    }
  },

  webpack: (config, { isServer }) => {
    // 解决 maptalks 重复导入问题
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // 添加空的 turbopack 配置以消除警告
  turbopack: {},
};

export default nextConfig;
