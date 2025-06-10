import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/*": ["./node_modules/@bitcoinerlab/secp256k1/**/*.wasm"],
  },
};

export default nextConfig;
