/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Suppresses ESLint errors during build
  },
};

module.exports = nextConfig;
