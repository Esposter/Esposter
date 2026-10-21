import type { UploadFileToSasOptions } from "@/models/file/UploadFileToSasOptions";
import type { FileSasEntity } from "@esposter/db-schema";

import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { settleAll, takeOne } from "@esposter/shared";

// The one SAS upload round-trip: generate write targets -> PUT the blocks -> (optionally) return read urls.
// Every upload site funnels through here so limit enforcement and progress reporting live in one place.
export const uploadFileToSas = async <TFileSasEntity extends FileSasEntity>({
  checkIsUploadSkipped,
  files,
  generateUploadFileSasEntities,
  isCreateOnly,
  onUploadProgress,
  onUploadStart,
}: UploadFileToSasOptions<TFileSasEntity>) => {
  const fileSasEntities = await generateUploadFileSasEntities(
    files.map(({ name, size, type }) => ({ filename: name, mimetype: type, size })),
  );
  onUploadStart?.(fileSasEntities);
  // Settled, not raced: a caller that reverts on failure deletes the batch's blobs, and `Promise.all` hands it
  // That failure while the siblings are still writing — a PUT landing after the deletion runs leaves a blob
  // Nothing references and no later sweep reaches. Failing only once every upload has stopped writing means
  // The revert always names a set that is complete and final.
  await settleAll(
    files.map((file, index) => async () => {
      const fileSasEntity = takeOne(fileSasEntities, index);
      if (checkIsUploadSkipped?.(fileSasEntity)) return;
      await uploadBlocks(
        file,
        fileSasEntity.sasUrl,
        onUploadProgress
          ? (progress) => {
              onUploadProgress(fileSasEntity, progress);
            }
          : undefined,
        { isCreateOnly },
      );
    }),
  );
  return fileSasEntities;
};
