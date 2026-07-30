import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // `headers` are matched before files in /public, so this applies to the
        // GLB. It's a content-addressed-by-name static asset that never changes
        // in place, so a repeat visit shouldn't pay for it again — without this
        // the dev/prod default is a revalidation round-trip on every load.
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
