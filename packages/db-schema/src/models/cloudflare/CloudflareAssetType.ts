// The asset-type token of a Cloudflare resource name, second after the environment, as Azure's names carry `st`, `func`
export const CloudflareAssetType = {
  D1Database: "d1",
  DeadLetterQueue: "dlq",
  Queue: "q",
  R2Bucket: "r2",
  Token: "tok",
  Worker: "wkr",
} as const;
export type CloudflareAssetType = (typeof CloudflareAssetType)[keyof typeof CloudflareAssetType];
