import type { HostedAssetDownloadFile } from "#src/models/HostedAssetDownloadFile";

import {
  HOSTED_ASSETS_DOWNLOAD_ATTEMPTS,
  HOSTED_ASSETS_RETRY_BASE_MS,
  HOSTED_ASSETS_RETRY_MAX_MS,
} from "#src/services/constants";
import { storeHostedAssetFile } from "#src/services/storeHostedAssetFile";
import { createExponentialBackoff, getResultAsync } from "@esposter/shared";

// A file kept in the cache within its attempts: each attempt counts the bytes it reads and gives them back when it
// Fails, and each attempt after the first waits longer than the one before. The result is the last attempt's, so a file
// That fails every attempt is the error the loading reports
export const downloadHostedAssetFile = (
  cache: Pick<Cache, "put">,
  { url }: HostedAssetDownloadFile,
  onBytes: (deltaBytes: number) => void,
): ReturnType<typeof getResultAsync<Blob>> => {
  const waitBeforeAttempt = createExponentialBackoff(HOSTED_ASSETS_RETRY_BASE_MS, HOSTED_ASSETS_RETRY_MAX_MS);
  const attemptDownload = (): ReturnType<typeof getResultAsync<Blob>> => {
    let attemptBytes = 0;
    return getResultAsync(() =>
      waitBeforeAttempt(() =>
        storeHostedAssetFile(cache, url, (byteLength) => {
          attemptBytes += byteLength;
          onBytes(byteLength);
        }),
      ),
    ).orTee(() => {
      onBytes(-attemptBytes);
    });
  };
  let download = attemptDownload();
  for (let attempt = 1; attempt < HOSTED_ASSETS_DOWNLOAD_ATTEMPTS; attempt++)
    download = download.orElse(() => attemptDownload());
  return download;
};
