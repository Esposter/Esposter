import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { fetchOk } from "#src/services/shared/fetchOk";

// One stored object's bytes, read anonymously from the dev account, which holds every object the lock names as prod does
export const downloadReferenceObject = async (blobName: string): Promise<Uint8Array> =>
  new Uint8Array(await (await fetchOk(`${GAME_DATA_DEV_BASE_URL}/${blobName}`)).arrayBuffer());
