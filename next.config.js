/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['api.dicebear.com'],
    unoptimized: true,
  },
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/main',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig; 