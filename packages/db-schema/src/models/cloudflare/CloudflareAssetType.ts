// The asset-type token of a Cloudflare resource name, second after the environment, as Azure's names carry `st`, `func`
export enum CloudflareAssetType {
  D1Database = "d1",
  DeadLetterQueue = "dlq",
  NotificationPolicy = "np",
  Queue = "q",
  R2Bucket = "r2",
  Token = "tok",
  Worker = "wkr",
}
