/** @type {import('next').NextConfig} */

const DEFAULT_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;

const nextConfig = {
  // reactStrictMode: false,
  devIndicators: false, // 禁用开发工具指示器
  output: 'standalone', // 使用standalone输出模式
  outputFileTracingExcludes: {
    '*': ['node_modules/**/*'],
  },
  outputFileTracingRoot: process.cwd(), // 设置为绝对路径
  experimental: {
    webpackBuildWorker: true, // 保留与 React 18 兼容的实验功能
  },
  // 配置应用的基础路径前缀 - 类似于webpack的publicPath
  basePath: process.env.NODE_ENV === 'development' ? '' : DEFAULT_BASE_PATH,
  // 静态资源CDN前缀配置 - 用于CDN部署
  assetPrefix: process.env.NODE_ENV === 'development' ? '' : DEFAULT_BASE_PATH,
  // eslint配置已移至单独的配置文件中
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 环境变量配置
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
  },

  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const rewrites = [
        {
          source: '/api/:path*',
          destination: `http://${process.env.NEXT_PUBLIC_BASE_URL}/:path*`, // 统一代理API请求
        },
      ];
      return rewrites;
    } else {
      return [];
    }
  },

  webpack: (
    config: { resolve: { fallback: Record<string, boolean> } },
    { isServer }: { isServer: boolean }
  ) => {
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
