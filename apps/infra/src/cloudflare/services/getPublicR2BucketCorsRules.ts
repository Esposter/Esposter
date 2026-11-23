import type * as cloudflare from "@pulumi/cloudflare";

// The shared public hosted bucket, which every product's scope prefix sits in, is read by any origin, with GET and
// HEAD and no request header: the page loads each object by its url, and the custom domain answers with
// `Access-Control-Allow-Origin` from this rule
export const getPublicR2BucketCorsRules = (): cloudflare.types.input.R2BucketCorsRule[] => [
  { allowed: { methods: ["GET", "HEAD"], origins: ["*"] }, id: "public-read" },
];
