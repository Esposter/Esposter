import type { ResourceRouter } from "@/models/resource/ResourceRouter";
import type { Resource, ResourceType } from "@esposter/db-schema";

import { MimeType } from "#shared/models/file/MimeType";
import { getSingleFileSasEntities } from "@/services/file/getSingleFileSasEntities";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";

// A document too large for one request body goes to Blob Storage first and is committed by reference: gzipped,
// Hashed so the commit can tell its own upload from another device's, PUT through a write SAS the server holds
// Against the owner's quota, and named by that hash to the server, which reads, verifies and saves it
export const saveStagedResourceContent = async (
  resourceRouter: ResourceRouter<ResourceType>,
  contentBytes: Uint8Array<ArrayBuffer>,
  { contentVersion, id }: Pick<Resource, "contentVersion" | "id">,
): Promise<Resource> => {
  const compressedStream = new Blob([contentBytes]).stream().pipeThrough(new CompressionStream("gzip"));
  const compressedContent = new Uint8Array(await new Response(compressedStream).arrayBuffer());
  const digest = await crypto.subtle.digest("SHA-256", compressedContent);
  const hash = new Uint8Array(digest).toHex();
  const sasUrl = await resourceRouter.generateUploadContentSasUrl.query({ id, size: compressedContent.byteLength });
  await uploadFileToSas({
    files: [new File([compressedContent], `${id}.json.gz`, { type: MimeType.Gzip })],
    generateUploadFileSasEntities: getSingleFileSasEntities(sasUrl),
  });
  return resourceRouter.saveStagedResourceContent.mutate({ contentVersion, hash, id });
};
