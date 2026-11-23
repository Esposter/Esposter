import type * as cloudflare from "@pulumi/cloudflare";

// A product's public bucket is read by any origin, with GET and HEAD and no request header: the page loads each object
// By its url, and the custom domain answers with `Access-Control-Allow-Origin` from this rule
export const getPublicR2BucketCorsRules = (): cloudflare.types.input.R2BucketCorsRule[] => [
  { allowed: { methods: ["GET", "HEAD"], origins: ["*"] }, id: "public-read" },
];
