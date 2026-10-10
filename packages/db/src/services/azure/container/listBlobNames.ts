import type { ListBlobNamesOptions } from "#src/models/azure/container/ListBlobNamesOptions";
import type { ContainerClient } from "@azure/storage-blob";

import { listBlobItems } from "#src/services/azure/container/listBlobItems";

export const listBlobNames = async (
  containerClient: ContainerClient,
  prefix: string,
  { createdBefore }: ListBlobNamesOptions = {},
): Promise<string[]> =>
  // `createdOn` is optional on the listing, and dropping the blobs missing it would turn a sweep into a silent no-op
  // That still reports success. `lastModified` is always present and never earlier, so it only ever holds a blob back
  // Longer — never deletes one the cutoff meant to spare
  (await listBlobItems(containerClient, prefix))
    .filter(({ createdOn, lastModified }) => !createdBefore || (createdOn ?? lastModified) < createdBefore)
    .map(({ name }) => name);
