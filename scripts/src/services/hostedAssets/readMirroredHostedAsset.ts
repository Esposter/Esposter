import type { HostedAssetName } from "hosted-assets";

import { fetchResponse } from "#src/services/shared/fetchResponse";
import { InvalidOperationError, Operation } from "@esposter/shared";
import {
  assertContentAddress,
  getContentAddress,
  HOSTED_ASSETS_MIRROR_DIRECTORY,
  readContentAddressedObject,
} from "@esposter/shared-node/cache";
import { getHostedAssetUrl } from "hosted-assets";

// One hosted object's bytes through the machine-wide content cache, fetched from its origin on a miss. A cached object is
// Checked as well, since the cache serves a hit without hashing it: a file that is not its name's bytes fails here rather
// Than passing as held
export const readMirroredHostedAsset = async (
  baseUrl: string,
  name: HostedAssetName,
  mirrorDirectory: string = HOSTED_ASSETS_MIRROR_DIRECTORY,
): Promise<Buffer> => {
  const url = getHostedAssetUrl(baseUrl, name);
  const bytes = await readContentAddressedObject(
    name.sha256,
    async () => {
      const response = await fetchResponse(url);
      if (!response.ok) throw new InvalidOperationError(Operation.Read, url, `responds ${response.status}`);
      return new Uint8Array(await response.arrayBuffer());
    },
    mirrorDirectory,
  );
  assertContentAddress(url, name.sha256, getContentAddress(bytes));
  return bytes;
};
