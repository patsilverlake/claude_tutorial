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
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/channels/:channelId',
          destination: '/channels/[channelId]',
        },
        {
          source: '/channels/:channelId/search',
          destination: '/channels/[channelId]/search',
        },
        {
          source: '/channels/:channelId/thread/:messageId',
          destination: '/channels/[channelId]/thread/[messageId]',
        },
        {
          source: '/dm/:userId',
          destination: '/dm/[userId]',
        },
      ],
    };
  },
};

module.exports = nextConfig; 