import type { FilePresignedUrlEntity } from "@esposter/db-schema";

// Adapts a single pre-generated presigned url into uploadFilesToPresignedUrls' batched generateUploadFilePresignedUrlEntities contract.
export const getSingleFilePresignedUrlEntities = (presignedUrl: string) => (): Promise<FilePresignedUrlEntity[]> =>
  Promise.resolve([{ id: "", presignedUrl }]);
