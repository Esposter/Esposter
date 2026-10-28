import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { fetchOk } from "#src/services/shared/fetchOk";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readContentAddressedObject } from "@esposter/shared-node/cache";

// The JSON of one published object, by its dataset and hash, through the machine-wide content cache. The cache is keyed
// By the hash alone, since the content is what the hash names, so the dev account serves each object once per machine
// However many steps, loops and worktrees read it
export const readPublishedGameDataObject = async <T>(dataset: string, hash: string): Promise<T> => {
  const bytes = await readContentAddressedObject(
    hash,
    async () =>
      new Uint8Array(
        await (await fetchOk(`${GAME_DATA_DEV_BASE_URL}/${getGameDataBlobName(dataset, hash)}`)).arrayBuffer(),
      ),
  );
  return parseMachineJson<T>(bytes.toString("utf8"));
};
