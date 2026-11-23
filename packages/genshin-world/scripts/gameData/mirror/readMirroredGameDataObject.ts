import type { HostedAssetName } from "hosted-assets";

import { readMirroredGameDataFile } from "#scripts/gameData/mirror/readMirroredGameDataFile";
import { HOSTED_ASSETS_MIRROR_DIRECTORY } from "@esposter/shared-node/cache";
import { getHostedAssetPath } from "hosted-assets";

// One hosted object's JSON through the content cache, at the path its name stores it under
export const readMirroredGameDataObject = async (
  name: HostedAssetName,
  mirrorDirectory: string = HOSTED_ASSETS_MIRROR_DIRECTORY,
): Promise<string> =>
  (await readMirroredGameDataFile(getHostedAssetPath(name), name.sha256, mirrorDirectory)).toString("utf8");
