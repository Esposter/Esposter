import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { fetchResponse } from "#src/services/shared/fetchResponse";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readContentAddressedObject } from "@esposter/shared-node/cache";
import { getGameDataObjectName } from "genshin-world/definitions";
import { getHostedAssetUrl } from "hosted-assets";

// The JSON of one published object, by its dataset and hash, through the machine-wide content cache. The cache is keyed
// By the hash alone, since the content is what the hash names, so the dev bucket serves each object once per machine
// However many steps, loops and worktrees read it
export const readPublishedGameDataObject = async <T>(dataset: string, hash: string): Promise<T> => {
  const url = getHostedAssetUrl(GAME_DATA_DEV_BASE_URL, getGameDataObjectName(dataset, hash));
  const bytes = await readContentAddressedObject(hash, async () => {
    const response = await fetchResponse(url);
    if (!response.ok) throw new InvalidOperationError(Operation.Read, url, `responds ${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
  });
  return parseMachineJson<T>(bytes.toString("utf8"));
};
