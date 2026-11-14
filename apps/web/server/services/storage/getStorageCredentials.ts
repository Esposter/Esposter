import type { StorageCredentials } from "@esposter/db";

// The R2 token presigned urls are signed with. Read per call from the environment, which the environment plugin checks
export const getStorageCredentials = (): StorageCredentials => ({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  environment: process.env.CLOUDFLARE_ENVIRONMENT,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
});
