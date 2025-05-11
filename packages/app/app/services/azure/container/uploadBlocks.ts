import { MEGABYTE } from "#shared/services/esposter/constants";
import { commitBlockList } from "@/services/azure/container/commitBlockList";

export const uploadBlocks = async (file: File, sasUrl: string) => {
  // 4MB block size (adjust as needed)
  const blockSize = 4 * MEGABYTE;
  const totalBlocks = Math.ceil(file.size / blockSize);
  const promises: Promise<Response>[] = [];
  const blockIds: string[] = [];

  for (let i = 0; i < totalBlocks; i++) {
    const blockId = btoa(`block-${i}`);
    const start = i * blockSize;
    const end = Math.min(start + blockSize, file.size);
    const blockContent = file.slice(start, end);
    const promise = fetch(`${sasUrl}&comp=block&blockid=${blockId}`, {
      body: blockContent,
      headers: {
        "Content-Type": file.type,
        "x-ms-blob-content-type": file.type,
        "x-ms-blob-type": "BlockBlob",
      },
      method: "PUT",
    });

    promises.push(promise);
    blockIds.push(blockId);
  }

  await Promise.all(promises);
  await commitBlockList(sasUrl, blockIds);
};
