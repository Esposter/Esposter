import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readContentAddressedObject } from "@esposter/shared-node/cache";

// The JSON of one published object, by its hash, through the machine-wide content cache, so the dev account serves each
// Object once per machine however many steps, loops and worktrees read it
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the caller names the type the record holds
export const readPublishedGameDataObject = async <T>(hash: string): Promise<T> => {
  const bytes = await readContentAddressedObject(
    hash,
    async () => new Uint8Array(await (await fetchOk(`${GAME_DATA_DEV_BASE_URL}/${hash}.json`)).arrayBuffer()),
  );
  return parseMachineJson<T>(bytes.toString("utf8"));
};
