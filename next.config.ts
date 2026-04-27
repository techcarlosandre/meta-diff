import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ddragon.leagueoflegends.com' },
      { protocol: 'https', hostname: 'raw.communitydragon.org' },
      { protocol: 'https', hostname: 'opgg-static.akamaized.net' },
    ],
  },
};


export default nextConfig;
