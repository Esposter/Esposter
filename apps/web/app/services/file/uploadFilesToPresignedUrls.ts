import type { UploadFilesToPresignedUrlsOptions } from "@/models/file/UploadFilesToPresignedUrlsOptions";
import type { FileSasEntity } from "@esposter/db-schema";

import { uploadFileToUrl } from "@/services/file/uploadFileToUrl";
import { settleAll, takeOne } from "@esposter/shared";

// The one presigned upload round-trip: generate write targets -> PUT each file to its url -> return the targets.
// Every upload site funnels through here so limit enforcement and progress reporting live in one place.
export const uploadFilesToPresignedUrls = async <TFileSasEntity extends FileSasEntity>({
  checkIsUploadSkipped,
  files,
  generateUploadFileSasEntities,
  isCreateOnly,
  onUploadProgress,
  onUploadStart,
}: UploadFilesToPresignedUrlsOptions<TFileSasEntity>) => {
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
      await uploadFileToUrl(file, fileSasEntity.sasUrl, {
        isCreateOnly,
        onProgress: onUploadProgress
          ? (progress) => {
              onUploadProgress(fileSasEntity, progress);
            }
          : undefined,
      });
    }),
  );
  return fileSasEntities;
};
