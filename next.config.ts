import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker standalone ビルド用（claude-poc-e2e の Dockerfile が依存）
  output: "standalone",
};

export default nextConfig;
