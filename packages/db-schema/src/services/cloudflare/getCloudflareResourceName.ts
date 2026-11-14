import type { CloudflareAssetType } from "#src/models/cloudflare/CloudflareAssetType";
import type { CloudflareEnvironment } from "#src/models/cloudflare/CloudflareEnvironment";

import { CLOUDFLARE_WORKLOAD } from "#src/services/cloudflare/constants";

// `<environment>-<assetType>-esposter-<purpose>`: the one spelling of every environment-owned Cloudflare name, read by
// Pulumi when it creates a resource and by the Workers when they name one, so the two can never disagree. The purpose
// Is the kebab-case value the app already uses (a bucket's `StorageBucket` value, a job's kebab-cased `QueueJob`)
export const getCloudflareResourceName = (
  environment: CloudflareEnvironment,
  assetType: CloudflareAssetType,
  purpose: string,
) => `${environment}-${assetType}-${CLOUDFLARE_WORKLOAD}-${purpose}`;
