import type { ResourceRouter } from "@/models/resource/ResourceRouter";
import type { ResourceInResource, ResourceType } from "@esposter/db-schema";

import { StorageStatusError } from "@/models/file/StorageStatusError";
import { Operation } from "@esposter/shared";

// A document larger than one request body read as the bytes storage holds, through a presigned read url the server
// Signs, so the server neither downloads, parses nor re-serializes it. The bytes are exactly the stored ones,
// Which also makes them the baseline a delta save is compressed against
export const readStoredResourceContent = async (
  resourceRouter: ResourceRouter<ResourceType>,
  id: ResourceInResource["id"],
): Promise<Uint8Array<ArrayBuffer>> => {
  const presignedUrl = await resourceRouter.generateReadContentSasUrl.query({ id });
  const response = await fetch(presignedUrl);
  if (!response.ok) throw new StorageStatusError(Operation.Read, readStoredResourceContent.name, response.status);
  return new Uint8Array(await response.arrayBuffer());
};
