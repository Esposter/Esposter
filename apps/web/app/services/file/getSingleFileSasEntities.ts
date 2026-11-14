import type { FileSasEntity } from "@esposter/db-schema";

// Adapts a single pre-generated presigned url into uploadFilesToPresignedUrls' batched generateUploadFileSasEntities contract.
export const getSingleFileSasEntities = (sasUrl: string) => (): Promise<FileSasEntity[]> =>
  Promise.resolve([{ id: "", sasUrl }]);
