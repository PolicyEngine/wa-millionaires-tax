/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined
  ? process.env.NEXT_PUBLIC_BASE_PATH
  : "/us/wa-millionaires-tax";

const nextConfig = {
  ...(basePath ? { basePath } : {}),
  output: "standalone",
};

module.exports = nextConfig;
