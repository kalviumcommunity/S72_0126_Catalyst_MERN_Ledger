import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    // Ensure Next resolves deps from this app folder (prevents it picking repo root)
    root: __dirname,
  },
};

export default nextConfig;
