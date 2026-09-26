import type { ResourceRouter } from "@/models/resource/ResourceRouter";
import type { Resource, ResourceType } from "@esposter/db-schema";

import { requestBlobStorage } from "@/services/azure/container/requestBlobStorage";

// A document larger than one request body read as the bytes Blob Storage holds, through a read SAS the server
// Signs, so the server neither downloads, parses nor re-serializes it. The bytes are exactly the stored ones,
// Which also makes them the baseline a delta save is compressed against
export const readStoredResourceContent = async (
  resourceRouter: ResourceRouter<ResourceType>,
  id: Resource["id"],
): Promise<Uint8Array<ArrayBuffer>> => {
  const sasUrl = await resourceRouter.generateReadContentSasUrl.query({ id });
  const response = await requestBlobStorage(sasUrl, { method: "GET" });
  return new Uint8Array(await response.arrayBuffer());
};
