import type * as cloudflare from "@pulumi/cloudflare";

import { CloudflareEnvironment } from "@esposter/db-schema";

// The origins a browser reaches a bucket's presigned urls from: the environment's own site, plus local development on the
// Develop estate
const R2BucketCorsOriginsMap = {
  [CloudflareEnvironment.Development]: ["https://dev.esposter.com", "http://localhost:3000"],
  [CloudflareEnvironment.Production]: ["https://esposter.com"],
} as const satisfies Record<CloudflareEnvironment, string[]>;

// A presigned url is fetched across origins: an upload PUTs with its signed `Content-Type` and, for a create-only write,
// `If-None-Match`, and a large document is read back with GET. R2 answers none of them without a CORS rule
export const getR2BucketCorsRules = (environment: CloudflareEnvironment): cloudflare.types.input.R2BucketCorsRule[] => [
  {
    allowed: {
      headers: ["Content-Type", "If-None-Match"],
      methods: ["GET", "HEAD", "PUT"],
      origins: [...R2BucketCorsOriginsMap[environment]],
    },
    exposeHeaders: ["ETag"],
    id: "presigned-browser-access",
    maxAgeSeconds: 3600,
  },
];
