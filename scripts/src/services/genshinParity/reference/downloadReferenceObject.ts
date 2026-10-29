import { GAME_DATA_DEV_BASE_URL } from "#src/services/gameData/constants";
import { REFERENCE_OBJECT_DOWNLOAD_TIMEOUT_MS } from "#src/services/genshinParity/reference/constants";
import { fetchOk } from "#src/services/shared/fetchOk";

// One stored object's bytes, read anonymously from the dev account, which holds every object the lock names as prod does
export const downloadReferenceObject = async (blobName: string): Promise<Uint8Array> => {
  const response = await fetchOk(`${GAME_DATA_DEV_BASE_URL}/${blobName}`, {
    timeoutMs: REFERENCE_OBJECT_DOWNLOAD_TIMEOUT_MS,
  });
  return new Uint8Array(await response.arrayBuffer());
};
