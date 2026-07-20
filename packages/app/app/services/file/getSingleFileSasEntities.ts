import type { FileSasEntity } from "@esposter/db-schema";

// Adapts a single pre-generated sas url into uploadFileToSas' batched generateUploadFileSasEntities contract.
export const getSingleFileSasEntities = (sasUrl: string) => async (): Promise<FileSasEntity[]> => [{ id: "", sasUrl }];
