import type { BlobRequestConditions, ContainerClient } from "@azure/storage-blob";

import { compressJson } from "#src/services/azure/container/compressJson";
import { uploadCompressedJson } from "#src/services/azure/container/uploadCompressedJson";

// The one way a JSON document is stored: compressed at the default level and uploaded, so a browser reading it through a
// SAS receives the JSON while every server reader decompresses it itself (readJsonBlob). Returns the stored length, which
// Is what an owner is charged, and the ETag the blob now holds, which a conditional write checks against `conditions`
// Passes an `ifMatch` or an `ifNoneMatch` through to the upload, so a write over a changed blob is refused
export const writeJsonBlob = async (
  containerClient: ContainerClient,
  blobName: string,
  serializedJson: string,
  conditions?: BlobRequestConditions,
): Promise<{ etag?: string; size: number }> =>
  uploadCompressedJson(containerClient, blobName, await compressJson(serializedJson), { conditions });
