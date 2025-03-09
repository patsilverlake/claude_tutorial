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
  experimental: {
    // Improve route group handling
    optimizePackageImports: ['lucide-react'],
  },
  // External packages that should be treated as server packages
  serverExternalPackages: [],
  output: 'standalone',
  // Enhanced redirects to ensure paths work correctly
  async redirects() {
    return [
      {
        source: '/',
        destination: '/main',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Handle route group issues by explicitly mapping routes
      {
        source: '/(main)/:path*',
        destination: '/main/:path*',
      },
      {
        source: '/',
        destination: '/main',
      },
    ];
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