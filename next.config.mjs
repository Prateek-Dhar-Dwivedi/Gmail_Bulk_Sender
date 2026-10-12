/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disables ESLint blocking production builds on hosting platforms
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Next will still typecheck via tsconfig
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
