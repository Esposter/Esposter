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
  await Promise.all(
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
  return fileSasEntities;
};
