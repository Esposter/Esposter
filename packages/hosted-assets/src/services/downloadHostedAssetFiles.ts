import type { HostedAssetDownloadFile } from "#src/models/HostedAssetDownloadFile";

import { HOSTED_ASSETS_DOWNLOAD_CONCURRENCY } from "#src/services/constants";
import { downloadHostedAssetFile } from "#src/services/downloadHostedAssetFile";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";

// The planned files fetched a few at a time into the cache, with the bytes loaded across all of them reported as each
// Chunk lands. A file that fails its attempts is listed by its path in the error, while the rest are still fetched, so
// A Retry plans only what is missing
export const downloadHostedAssetFiles = (
  cache: Pick<Cache, "put">,
  files: readonly HostedAssetDownloadFile[],
  onProgress: (loadedBytes: number) => void,
): ReturnType<typeof getResultAsync<void>> =>
  getResultAsync(async () => {
    const fileIterator = files.values();
    const failedPaths: string[] = [];
    let loadedBytes = 0;
    const reportDeltaBytes = (deltaBytes: number): void => {
      loadedBytes += deltaBytes;
      onProgress(loadedBytes);
    };
    const fetchFiles = async (): Promise<void> => {
      for (const file of fileIterator)
        // Share one iterator, and each fetches one file at a time
        // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: HOSTED_ASSETS_DOWNLOAD_CONCURRENCY workers
        await downloadHostedAssetFile(cache, file, reportDeltaBytes).match(noop, () => {
          failedPaths.push(file.path);
        });
    };
    await Promise.all(Array.from({ length: HOSTED_ASSETS_DOWNLOAD_CONCURRENCY }, () => fetchFiles()));
    if (failedPaths.length > 0)
      throw new InvalidOperationError(Operation.Read, failedPaths.join(", "), "failed after its attempts");
  });
