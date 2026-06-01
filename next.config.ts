import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The googleapis SDK is a server-only dependency. Keeping it external avoids
  // bundling the (large) library into serverless function output unnecessarily.
  serverExternalPackages: ["googleapis", "@prisma/client"],
  images: {
    remotePatterns: [
      // Google profile pictures
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Google Photos base URLs
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
