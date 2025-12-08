import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  output: 'standalone',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
};

export default nextConfig;
