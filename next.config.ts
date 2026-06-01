import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // If in development, allow 'unsafe-eval' so hot-reload works.
            // If in production, remove 'unsafe-eval' for strict security.
            value: isDev 
              ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
              : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
          },
        ],
      },
    ];
  },
};

export default nextConfig;