import type { HostedAssetName } from "#src/models/HostedAssetName";

import { z } from "zod";

// One object a lock names: the sha256 of its bytes is its name, under its scope and with its extension, and the byte
// Count is what a preload plans by. The content type is not kept beside them, since the extension names it through
// `HOSTED_ASSET_CONTENT_TYPES`, so the entry cannot hold a type that disagrees with the name it is served under
export interface HostedAssetObject extends HostedAssetName {
  bytes: number;
}

export const hostedAssetObjectSchema: z.ZodType<HostedAssetObject> = z.object({
  bytes: z.int().nonnegative(),
  extension: z.string(),
  scope: z.string().min(1),
  sha256: z.hash("sha256"),
});
