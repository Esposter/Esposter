import { CloudflareEnvironment } from "@esposter/db-schema";

// The origin each environment's public buckets are served under. The web Worker routes a request by its bucket's name, so
// A public object's URL is its origin, then its bucket, then its key
export const PUBLIC_ASSETS_BASE_URL_MAP: Readonly<Record<CloudflareEnvironment, string>> = {
  [CloudflareEnvironment.Development]: "https://assets.dev.esposter.com",
  [CloudflareEnvironment.Production]: "https://assets.esposter.com",
};
// A stored object runs to several megabytes, so a request to R2 is bounded past the longest of them
export const R2_REQUEST_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
