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
  // No redirects or complex configurations - we'll handle routing on the client side
};

module.exports = nextConfig; 