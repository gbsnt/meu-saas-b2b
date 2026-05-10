/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Isso ajuda se houver erro de variáveis de ambiente no build
  output: 'standalone', 
};

export default nextConfig;