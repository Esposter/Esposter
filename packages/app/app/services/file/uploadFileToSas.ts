import type { UploadFileToSasOptions } from "@/models/file/UploadFileToSasOptions";
import type { FileEntity, FileSasEntity } from "@esposter/db-schema";

import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { takeOne } from "@esposter/shared";

// The one SAS upload round-trip: generate write targets -> PUT the blocks -> (optionally) return read urls.
// Every upload site funnels through here so limit enforcement and progress reporting live in one place.
export async function uploadFileToSas(
  options: {
    generateDownloadFileSasUrls: (files: Pick<FileEntity, "filename" | "id" | "mimetype">[]) => Promise<string[]>;
  } & UploadFileToSasOptions,
): Promise<string[]>;
export async function uploadFileToSas<TFileSasEntity extends FileSasEntity>(
  options: UploadFileToSasOptions<TFileSasEntity>,
): Promise<TFileSasEntity[]>;
export async function uploadFileToSas<TFileSasEntity extends FileSasEntity>({
  files,
  generateDownloadFileSasUrls,
  generateUploadFileSasEntities,
  onUploadProgress,
  onUploadStart,
}: {
  generateDownloadFileSasUrls?: (files: Pick<FileEntity, "filename" | "id" | "mimetype">[]) => Promise<string[]>;
} & UploadFileToSasOptions<TFileSasEntity>): Promise<string[] | TFileSasEntity[]> {
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
  if (!generateDownloadFileSasUrls) return fileSasEntities;
  return generateDownloadFileSasUrls(
    files.map((file, index) => ({ filename: file.name, id: takeOne(fileSasEntities, index).id, mimetype: file.type })),
  );
}
