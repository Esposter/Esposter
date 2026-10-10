import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

// The JSON of one published object, by its hash, as the dev account serves it
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the caller names the type the record holds
export const readPublishedGameDataObject = async <T>(hash: string): Promise<T> => {
  const response = await fetchOk(`${GAME_DATA_DEV_BASE_URL}/${hash}.json`);
  return parseMachineJson<T>(await response.text());
};
