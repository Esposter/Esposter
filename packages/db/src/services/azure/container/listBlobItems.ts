import type { ListedBlobItem } from "#src/models/azure/container/ListedBlobItem";
import type { ContainerClient } from "@azure/storage-blob";

import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";

// Always flat, never `listBlobsByHierarchy`: every prefix here names a directory without its trailing delimiter,
// And a hierarchy listing classifies everything below such a prefix as a BlobPrefix rather than a BlobItem — so
// It resolves to zero blobs and hands its caller a successful empty clone or teardown for a full directory.
export const listBlobItems = async (containerClient: ContainerClient, prefix: string): Promise<ListedBlobItem[]> => {
  const blobItems: ListedBlobItem[] = [];
  const pages = containerClient.listBlobsFlat({ prefix }).byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE });
  for await (const { segment } of pages)
    blobItems.push(
      ...segment.blobItems.map(({ name, properties }) => ({
        createdOn: properties.createdOn,
        lastModified: properties.lastModified,
        name,
      })),
    );
  return blobItems;
};
