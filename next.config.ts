import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (local dev only) ships WASM and must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Challenge photos are resized on the phone (~300 KB); leave headroom over the 1 MB default.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
};

export default nextConfig;
