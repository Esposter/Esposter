import type { R2Bucket } from "@cloudflare/workers-types";

import { writeJsonBlob } from "@esposter/db";
import { TRPCError } from "@trpc/server";

// Writes a blob's JSON under the ETag its caller read: the write lands only while the blob still carries that ETag, and
// An absent one means the blob must not exist yet. A write refused for either is a CONFLICT, because the blob changed
// Since it was read, and the caller answers it by reading again
export const writeBlobState = async (
  bucket: R2Bucket,
  blobName: string,
  serializedJson: string,
  etag: string | undefined,
): Promise<string> => {
  const onlyIf = etag === undefined ? { etagDoesNotMatch: "*" } : { etagMatches: etag };
  const written = await writeJsonBlob(bucket, blobName, serializedJson, onlyIf);
  if (!written) throw new TRPCError({ code: "CONFLICT", message: "The save changed since it was read" });
  // A write that landed always answers the ETag it was stored under, so an absent one is a service fault, not a result
  if (written.etag === undefined)
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The write answered no ETag" });
  return written.etag;
};
