import type { CharacterPackDownloadFile } from "#src/models/character/CharacterPackDownloadFile";

import {
  CHARACTER_PACK_DOWNLOAD_ATTEMPTS,
  CHARACTER_PACK_RETRY_BASE_MS,
  CHARACTER_PACK_RETRY_MAX_MS,
} from "#src/services/character/constants";
import { storeCharacterPackFile } from "#src/services/character/storeCharacterPackFile";
import { createExponentialBackoff, getResultAsync } from "@esposter/shared";

// A file kept in the cache within its attempts: each attempt counts the bytes it reads and gives them back when it fails,
// And each attempt after the first waits longer than the one before. The result is the last attempt's, so a file that
// Fails every attempt is the error the loading reports
export const downloadCharacterPackFile = (
  cache: Pick<Cache, "put">,
  { url }: CharacterPackDownloadFile,
  onBytes: (deltaBytes: number) => void,
): ReturnType<typeof getResultAsync<void>> => {
  const waitBeforeAttempt = createExponentialBackoff(CHARACTER_PACK_RETRY_BASE_MS, CHARACTER_PACK_RETRY_MAX_MS);
  const attemptDownload = (): ReturnType<typeof getResultAsync<void>> => {
    let attemptBytes = 0;
    return getResultAsync(() =>
      waitBeforeAttempt(() =>
        storeCharacterPackFile(cache, url, (byteLength) => {
          attemptBytes += byteLength;
          onBytes(byteLength);
        }),
      ),
    ).orTee(() => {
      onBytes(-attemptBytes);
    });
  };
  let download = attemptDownload();
  for (let attempt = 1; attempt < CHARACTER_PACK_DOWNLOAD_ATTEMPTS; attempt++)
    download = download.orElse(() => attemptDownload());
  return download;
};
