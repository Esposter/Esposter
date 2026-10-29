import type { CharacterPackDownloadFile } from "#src/models/character/CharacterPackDownloadFile";

import { CHARACTER_PACK_DOWNLOAD_CONCURRENCY } from "#src/services/character/constants";
import { downloadCharacterPackFile } from "#src/services/character/downloadCharacterPackFile";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";

// The planned files fetched a few at a time into the cache, with the bytes loaded across all of them reported as each
// Chunk lands. A file that fails its attempts is listed by its path in the error, while the rest are still fetched, so a
// Retry plans only what is missing
export const downloadCharacterPackFiles = (
  cache: Pick<Cache, "put">,
  files: readonly CharacterPackDownloadFile[],
  onProgress: (loadedBytes: number) => void,
): ReturnType<typeof getResultAsync<void>> =>
  getResultAsync(async () => {
    const fileIterator = files.values();
    const failedPaths: string[] = [];
    let loadedBytes = 0;
    const fetchFiles = async (): Promise<void> => {
      for (const file of fileIterator)
        await downloadCharacterPackFile(cache, file, (deltaBytes) => {
          loadedBytes += deltaBytes;
          onProgress(loadedBytes);
        }).match(noop, () => {
          failedPaths.push(file.path);
        });
    };
    await Promise.all(Array.from({ length: CHARACTER_PACK_DOWNLOAD_CONCURRENCY }, () => fetchFiles()));
    if (failedPaths.length > 0)
      throw new InvalidOperationError(Operation.Read, failedPaths.join(", "), "failed after its attempts");
  });
