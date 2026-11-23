import type { HostedAssetName } from "hosted-assets";

import { readFileResponse } from "@esposter/shared";
import {
  assertContentAddress,
  getContentAddress,
  HOSTED_ASSETS_MIRROR_DIRECTORY,
  readContentAddressedObject,
} from "@esposter/shared-node/cache";
import { getHostedAssetUrl, HOSTED_ASSETS_FETCH_TIMEOUT_MS } from "hosted-assets";

// One hosted object's bytes through the machine-wide content cache, fetched from its origin on a miss. A cached object
// Is Checked as well, since the cache serves a hit without hashing it: a file that is not its name's bytes fails here
// Rather Than passing as held
export const readMirroredHostedAsset = async (
  baseUrl: string,
  name: HostedAssetName,
  mirrorDirectory: string = HOSTED_ASSETS_MIRROR_DIRECTORY,
): Promise<Buffer> => {
  const url = getHostedAssetUrl(baseUrl, name);
  const bytes = await readContentAddressedObject(
    name.sha256,
    async () => {
      // Bounded as the store's downloads are, so one stalled object cannot hold a fill's slot for good
      const response = await readFileResponse(url, HOSTED_ASSETS_FETCH_TIMEOUT_MS);
      return new Uint8Array(await response.arrayBuffer());
    },
    mirrorDirectory,
  );
  assertContentAddress(url, name.sha256, getContentAddress(bytes));
  return bytes;
};
