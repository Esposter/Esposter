import type { HostedAssetLock } from "hosted-assets";

import { readHostedAssetLock } from "#src/services/hostedAssets/readHostedAssetLock";
import { existsSync } from "node:fs";

// A product's lock as the working tree has it.
// A product whose first publish has not written one yet gets the empty lock.
export const readPublishedHostedAssetLock = (lockPath: string): Promise<HostedAssetLock> =>
  existsSync(lockPath) ? readHostedAssetLock(lockPath) : Promise.resolve({ indexes: {}, objects: {} });
