import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const repo = 'PizzaDAO-Arcade';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : ''
};

export default nextConfig;
