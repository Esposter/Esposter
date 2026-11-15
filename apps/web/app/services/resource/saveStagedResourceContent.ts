import type { ResourceRouter } from "@/models/resource/ResourceRouter";
import type { ResourceInResource, ResourceType } from "@esposter/db-schema";

import { MimeType } from "#shared/models/file/MimeType";
import { getSingleFilePresignedUrlEntities } from "@/services/file/getSingleFilePresignedUrlEntities";
import { uploadFilesToPresignedUrls } from "@/services/file/uploadFilesToPresignedUrls";
import { getSha256Hex } from "@/services/shared/getSha256Hex";

// A document too large for one request body goes to Blob Storage first and is committed by reference: gzipped,
// Hashed so the commit can tell its own upload from another device's, PUT through a presigned write url the server holds
// Against the owner's quota, and named by that hash to the server, which reads, verifies and saves it
export const saveStagedResourceContent = async (
  resourceRouter: ResourceRouter<ResourceType>,
  contentBytes: Uint8Array<ArrayBuffer>,
  { contentVersion, id }: Pick<ResourceInResource, "contentVersion" | "id">,
): Promise<ResourceInResource> => {
  const compressedStream = new Blob([contentBytes]).stream().pipeThrough(new CompressionStream("gzip"));
  const compressedContent = new Uint8Array(await new Response(compressedStream).arrayBuffer());
  const hash = await getSha256Hex(compressedContent);
  const presignedUrl = await resourceRouter.generateUploadContentPresignedUrl.query({
    id,
    size: compressedContent.byteLength,
  });
  await uploadFilesToPresignedUrls({
    files: [new File([compressedContent], `${id}.json.gz`, { type: MimeType.Gzip })],
    generateUploadFilePresignedUrlEntities: getSingleFilePresignedUrlEntities(presignedUrl),
  });
  return resourceRouter.saveStagedResourceContent.mutate({ contentVersion, hash, id });
};
