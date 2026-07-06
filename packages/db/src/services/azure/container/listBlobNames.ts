import type { ContainerClient } from "@azure/storage-blob";

import { AZURE_MAX_PAGE_SIZE } from "@esposter/db-schema";

export const listBlobNames = async (
  containerClient: ContainerClient,
  prefix: string,
  isDeep?: true,
): Promise<string[]> => {
  const blobNames: string[] = [];
  const pages = isDeep
    ? containerClient.listBlobsFlat({ prefix }).byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE })
    : containerClient.listBlobsByHierarchy("/", { prefix }).byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE });
  for await (const { segment } of pages) blobNames.push(...segment.blobItems.map(({ name }) => name));
  return blobNames;
};
