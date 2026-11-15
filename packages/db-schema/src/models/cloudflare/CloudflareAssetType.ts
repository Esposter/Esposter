// The asset-type token of a Cloudflare resource name, second after the environment
export const CloudflareAssetType = {
  D1Database: "d1",
  DeadLetterQueue: "dlq",
  Queue: "q",
  R2Bucket: "r2",
  RealtimeKitApp: "rtk",
  Token: "tok",
  Worker: "wkr",
} as const;
export type CloudflareAssetType = (typeof CloudflareAssetType)[keyof typeof CloudflareAssetType];
