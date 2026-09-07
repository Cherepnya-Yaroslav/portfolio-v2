import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.PORTFOLIO_BUILD_DIR || ".next",
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return [{ source: "/", destination: "/ru", permanent: false }];
  },
};

export default nextConfig;
