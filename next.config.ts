import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  reactStrictMode: true,
  experimental: {
    devtoolSegmentExplorer: false
  }
};

export default nextConfig;
