import type { HostedAssetLock } from "hosted-assets";

import { readHostedAssetLock } from "#src/services/hostedAssets/readHostedAssetLock";
import { existsSync } from "node:fs";

// A product's lock as the working tree has it, or the empty lock of a product whose first publish has not written one yet
export const readPublishedHostedAssetLock = (lockPath: string): Promise<HostedAssetLock> =>
  existsSync(lockPath) ? readHostedAssetLock(lockPath) : Promise.resolve({ indexes: {}, objects: {} });
