import type * as cloudflare from "@pulumi/cloudflare";

import { createR2Bucket } from "#src/cloudflare/services/createR2Bucket";
import { CloudflareEnvironment, StorageBucket } from "@esposter/db-schema";

export const devR2EsposterMessageAssets: cloudflare.R2Bucket = createR2Bucket(
  CloudflareEnvironment.Development,
  StorageBucket.MessageAssets,
);
