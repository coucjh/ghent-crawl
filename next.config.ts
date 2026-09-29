import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (local dev only) ships WASM and must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
