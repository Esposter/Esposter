import { MEGABYTE } from "#shared/services/app/constants";
import { commitBlockList } from "@/services/azure/container/commitBlockList";
import { BLOB_CONTENT_TYPE_HEADER } from "@/services/azure/container/constants";
import { requestBlobStorage } from "@/services/azure/container/requestBlobStorage";
import { getResultAsync } from "@esposter/shared";

export const uploadBlocks = async (file: Blob, sasUrl: string, progressNotifier?: (progress: number) => void) => {
  const blockSize = 4 * MEGABYTE;
  const totalBlocks = Math.ceil(file.size / blockSize);
  const blockUploads: Promise<void>[] = [];
  const blockIds: string[] = [];
  // Azure refuses a block list whose decoded ids differ in length, so the index is padded to the widest one this upload
  // Names — unpadded, the eleventh block of a blob past 40 MB fails the commit
  const blockIndexWidth = String(totalBlocks).length;
  let landedBlockCount = 0;
  const reportLandedBlock = () => {
    landedBlockCount++;
    progressNotifier?.(landedBlockCount / totalBlocks);
  };

  for (let index = 0; index < totalBlocks; index++) {
    const blockId = btoa(`block-${String(index).padStart(blockIndexWidth, "0")}`);
    const start = index * blockSize;
    const end = Math.min(start + blockSize, file.size);
    blockUploads.push(
      getResultAsync(() =>
        requestBlobStorage(`${sasUrl}&comp=block&blockid=${blockId}`, {
          body: file.slice(start, end),
          headers: { [BLOB_CONTENT_TYPE_HEADER]: file.type, "Content-Type": file.type, "x-ms-blob-type": "BlockBlob" },
          method: "PUT",
        }),
      ).match(reportLandedBlock, (error) => {
        throw error;
      }),
    );
    blockIds.push(blockId);
  }

  await Promise.all(blockUploads);
  // An empty file has no block to count, so its completion is the one progress it reports
  if (!totalBlocks) progressNotifier?.(1);
  // The blob keeps the file's own type, not the commit request's — see commitBlockList
  await commitBlockList(sasUrl, blockIds, file.type);
};
