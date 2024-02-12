/** @type {import('next').NextConfig} */
import makePwa from "next-pwa";
import makeAnalyser from "@next/bundle-analyzer";

const withPWA = makePwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  maximumFileSizeToCacheInBytes: 3000000,
});

const withBundleAnalyzer = makeAnalyser({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = withBundleAnalyzer(
  withPWA({
    reactStrictMode: true,
    compiler: {
      removeConsole: process.env.NODE_ENV === "production",
    },
  })
);

export default nextConfig;
