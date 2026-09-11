import type { NextConfig } from "next";

const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

const nextConfig: NextConfig = {
  distDir: process.env.PORTFOLIO_BUILD_DIR || ".next",
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: storageUrl ? [new URL("/storage/v1/object/public/portfolio-images/projects/**", storageUrl)] : [],
    maximumRedirects: 0,
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development" && Boolean(storageUrl && ["localhost", "127.0.0.1"].includes(new URL(storageUrl).hostname)),
  },
  async redirects() {
    return [{ source: "/", destination: "/ru", permanent: false }];
  },
};

export default nextConfig;
