import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16 uses Turbopack by default)
  turbopack: {},
  output: 'standalone',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Exclude these packages from server-side bundling (they're browser-only)
  serverExternalPackages: [
    '@realtimex/piper-tts-web',
    'speech-to-speech',
    'onnxruntime-web'
  ],
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
    
    // Exclude heavy browser-only packages from being processed during build
    if (!isServer) {
      config.externals = config.externals || [];
      if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = [
          originalExternals,
          ({ request }: { request: string }) => {
            if (
              request === 'speech-to-speech' ||
              request === '@realtimex/piper-tts-web' ||
              request === 'onnxruntime-web'
            ) {
              return `commonjs ${request}`;
            }
          },
        ];
      }
    }
    
    return config;
  },
};

export default nextConfig;
