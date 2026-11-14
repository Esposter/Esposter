import type { CloudflareAssetType } from "#src/models/cloudflare/CloudflareAssetType";

import { CLOUDFLARE_WORKLOAD } from "#src/services/cloudflare/constants";

// An account-scoped resource belongs to no environment, so it drops that token, as Azure's subscription-scoped names do
export const getCloudflareAccountResourceName = (assetType: CloudflareAssetType, purpose: string) =>
  `${assetType}-${CLOUDFLARE_WORKLOAD}-${purpose}`;
