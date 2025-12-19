import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow serving images from the local Oshi_data directory
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  // Increase body size limit for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
