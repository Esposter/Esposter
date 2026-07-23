import type { ContainerClient } from "@azure/storage-blob";

import { AZURE_MAX_PAGE_SIZE } from "@esposter/db-schema";

interface ListBlobNamesOptions {
  // Keeps only blobs created strictly before this instant — the filter a prefix sweep needs so a blob that was
  // Just uploaded, but whose owning row write has not landed yet, is never mistaken for an orphan
  createdBefore?: Date;
  isDeep?: true;
}

export const listBlobNames = async (
  containerClient: ContainerClient,
  prefix: string,
  { createdBefore, isDeep }: ListBlobNamesOptions = {},
): Promise<string[]> => {
  const blobNames: string[] = [];
  const pages = isDeep
    ? containerClient.listBlobsFlat({ prefix }).byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE })
    : containerClient.listBlobsByHierarchy("/", { prefix }).byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE });
  for await (const { segment } of pages)
    blobNames.push(
      ...segment.blobItems
        .filter(({ properties }) => !createdBefore || (properties.createdOn && properties.createdOn < createdBefore))
        .map(({ name }) => name),
    );
  return blobNames;
};
