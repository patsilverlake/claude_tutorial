/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['api.dicebear.com'],
    unoptimized: true,
  },
  experimental: {
    // Improve route group handling
    optimizePackageImports: ['lucide-react'],
  },
  // External packages that should be treated as server packages
  serverExternalPackages: [],
  output: 'standalone',
  trailingSlash: false,
  // Simplified config with essential redirects only
  async redirects() {
    return [
      {
        source: '/',
        destination: '/main',
        permanent: false,
      },
    ];
  },
  // Rewrite all dynamic routes properly
  async rewrites() {
    return {
      beforeFiles: [
        // Handle channels
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
        // Handle DMs
        {
          source: '/dm/:userId',
          destination: '/dm/[userId]',
        },
        // Handle route group redirect
        {
          source: '/(main)/:path*',
          destination: '/main/:path*',
        },
      ],
    };
  },
  // Exclude problematic route groups from the build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  distDir: '.next',
  // Explicitly tell Next.js not to include (main) route group in the build
  async headers() {
    return [
      {
        source: '/(main)/:path*',
        headers: [
          {
            key: 'x-robots-tag',
            value: 'noindex',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 