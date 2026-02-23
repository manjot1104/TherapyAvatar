import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16 uses Turbopack by default)
  turbopack: {},
  output: 'standalone',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Exclude these packages from server-side bundling (they're browser-only)
  // Note: serverComponentsExternalPackages might not be needed in Next.js 16
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Set fallbacks for both client and server to prevent fs/path issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    // Provide empty stubs for fs and path globally (browser-only packages)
    const fsStubPath = require.resolve('./webpack-fs-stub.js');
    const pathStubPath = require.resolve('./webpack-path-stub.js');
    
    config.resolve.alias = {
      ...config.resolve.alias,
      'fs': fsStubPath,
      'path': pathStubPath,
    };
    
    return config;
  },
};

export default nextConfig;
