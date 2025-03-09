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
  async rewrites() {
    return [
      // Handle route group issues by explicitly mapping routes
      {
        source: '/',
        destination: '/main',
      },
    ];
  },
};

module.exports = nextConfig; 