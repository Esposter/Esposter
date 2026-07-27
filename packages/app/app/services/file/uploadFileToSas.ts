import type { UploadFileToSasOptions } from "@/models/file/UploadFileToSasOptions";
import type { FileSasEntity } from "@esposter/db-schema";

import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { takeOne } from "@esposter/shared";

// The one SAS upload round-trip: generate write targets -> PUT the blocks -> (optionally) return read urls.
// Every upload site funnels through here so limit enforcement and progress reporting live in one place.
export const uploadFileToSas = async <TFileSasEntity extends FileSasEntity>({
  files,
  generateUploadFileSasEntities,
  onUploadProgress,
  onUploadStart,
}: UploadFileToSasOptions<TFileSasEntity>): Promise<TFileSasEntity[]> => {
  const fileSasEntities = await generateUploadFileSasEntities(
    files.map(({ name, size, type }) => ({ filename: name, mimetype: type, size })),
  );
  onUploadStart?.(fileSasEntities);
  // Settled, not raced: a caller that reverts on failure deletes the batch's blobs, and `Promise.all` hands it
  // That failure while the siblings are still writing — a PUT landing after the deletion runs leaves a blob
  // Nothing references and no later sweep reaches. Failing only once every upload has stopped writing means
  // The revert always names a set that is complete and final.
  const uploadResults = await Promise.allSettled(
    files.map((file, index) => {
      const fileSasEntity = takeOne(fileSasEntities, index);
      return uploadBlocks(
        file,
        fileSasEntity.sasUrl,
        onUploadProgress
          ? (progress) => {
              onUploadProgress(fileSasEntity, progress);
            }
          : undefined,
      );
    }),
  );
  const rejectedResults = uploadResults.filter((uploadResult) => uploadResult.status === "rejected");
  if (rejectedResults.length > 0) throw takeOne(rejectedResults).reason;
  return fileSasEntities;
};
