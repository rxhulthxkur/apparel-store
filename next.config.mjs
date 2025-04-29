/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
    images: {
        domains: ['cdn.shopify.com'],
      },
};

export default nextConfig;
