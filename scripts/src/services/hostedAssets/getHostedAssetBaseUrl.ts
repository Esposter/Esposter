import type { CloudflareEnvironment, StorageBucket } from "@esposter/db-schema";

import { PUBLIC_ASSETS_BASE_URL_MAP } from "#src/services/cloudflare/constants";

// The URL a product's objects are read under in an environment: its bucket's name under the origin, which anyone can fetch
// From. The assets route keys a bucket by its name in the app, not by its R2 name
export const getHostedAssetBaseUrl = (environment: CloudflareEnvironment, bucket: StorageBucket): string =>
  `${PUBLIC_ASSETS_BASE_URL_MAP[environment]}/${bucket}`;
