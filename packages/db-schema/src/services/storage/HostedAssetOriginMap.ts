import { CloudflareEnvironment } from "#src/models/cloudflare/CloudflareEnvironment";

// The origin every hosted product's objects are served from in each environment: the custom domain on the one shared
// Hosted bucket, so a product's objects sit under its own scope prefix and no product needs a domain of its own
export const HostedAssetOriginMap = {
  [CloudflareEnvironment.Development]: "https://hosted.dev.esposter.com",
  [CloudflareEnvironment.Production]: "https://hosted.esposter.com",
} as const satisfies Record<CloudflareEnvironment, string>;
