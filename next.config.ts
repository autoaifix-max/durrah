import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  experimental: { cpus: 2 },
  // Images are served as responsive local WebP assets in this static stage.
  // Enable server-side image optimization only with an approved hosted server.
};

export default nextConfig;
