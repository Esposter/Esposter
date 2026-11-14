import type { CloudflareEnvironment } from "@esposter/db-schema";

// The R2 token a presigned url is signed with, the account whose S3 endpoint that url is for, and the environment whose
// Bucket names the url names. A binding names a bucket without the environment, since bindings are the same in both
// Environments, but the S3 endpoint takes the full name
export interface StorageCredentials {
  accessKeyId: string;
  accountId: string;
  environment: CloudflareEnvironment;
  secretAccessKey: string;
}
