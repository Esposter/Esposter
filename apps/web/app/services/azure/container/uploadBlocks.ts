import type { ProgressNotifier } from "p-progress";

import { MEGABYTE } from "#shared/services/app/constants";
import { commitBlockList } from "@/services/azure/container/commitBlockList";
import { BLOB_CONTENT_TYPE_HEADER } from "@/services/azure/container/constants";
import { PProgress } from "p-progress";

export const uploadBlocks = async (file: Blob, sasUrl: string, progressNotifier?: ProgressNotifier) => {
  const blockSize = 4 * MEGABYTE;
  const totalBlocks = Math.ceil(file.size / blockSize);
  const promises: Promise<Response>[] = [];
  const blockIds: string[] = [];

  for (let i = 0; i < totalBlocks; i++) {
    const blockId = btoa(`block-${i}`);
    const start = i * blockSize;
    const end = Math.min(start + blockSize, file.size);
    promises.push(
      fetch(`${sasUrl}&comp=block&blockid=${blockId}`, {
        body: file.slice(start, end),
        headers: {
          [BLOB_CONTENT_TYPE_HEADER]: file.type,
          "Content-Type": file.type,
          "x-ms-blob-type": "BlockBlob",
        },
        method: "PUT",
      }),
    );
    blockIds.push(blockId);
  }

  const allProgressPromises = PProgress.all(promises);
  if (progressNotifier) allProgressPromises.onProgress(progressNotifier);
  await allProgressPromises;
  // The blob keeps the file's own type, not the commit request's — see commitBlockList
  await commitBlockList(sasUrl, blockIds, file.type);
};
