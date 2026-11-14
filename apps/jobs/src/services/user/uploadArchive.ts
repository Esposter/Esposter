import type { R2Bucket, R2MultipartUpload, R2UploadedPart } from "@cloudflare/workers-types";

import { DATA_EXPORT_CONTENT_TYPE } from "#src/services/user/constants";
import { getResultAsync, KIBIBYTE, noop } from "@esposter/shared";

// R2 takes a stream of unknown length only as a multipart upload.
// The archive's length is not known until its last entry is written.
// Every part but the last is at least this large, which is R2's minimum for a part.
const MIN_UPLOAD_PART_BYTES = 5 * KIBIBYTE * KIBIBYTE;

// The archive is read a part at a time: a part is sent once it reaches the minimum, so the upload holds one part at most
const uploadParts = async (
  upload: R2MultipartUpload,
  archive: AsyncIterable<Uint8Array>,
): Promise<R2UploadedPart[]> => {
  const parts: R2UploadedPart[] = [];
  let chunks: Uint8Array[] = [];
  let bufferedBytes = 0;
  const uploadBufferedPart = async () => {
    // Each part is sent after the one before it, since a part's number is the position it is completed in
    parts.push(await upload.uploadPart(parts.length + 1, Buffer.concat(chunks)));
    chunks = [];
    bufferedBytes = 0;
  };
  for await (const chunk of archive) {
    chunks.push(chunk);
    bufferedBytes += chunk.byteLength;
    // oxlint-disable-next-line no-await-in-loop -- the parts are sent in order, so each waits for the one before it
    if (bufferedBytes >= MIN_UPLOAD_PART_BYTES) await uploadBufferedPart();
  }
  // The last part is the one under the minimum, and the archive always ends in a zip record, so there is always one
  if (bufferedBytes > 0) await uploadBufferedPart();
  return parts;
};

// Streams the archive into the object named for it.
// A failed part abandons the upload rather than leaving it for R2 to age out, so a truncated archive is never completed.
export const uploadArchive = async (
  bucket: R2Bucket,
  blobName: string,
  archive: AsyncIterable<Uint8Array>,
): Promise<void> => {
  const upload = await bucket.createMultipartUpload(blobName, {
    httpMetadata: { contentType: DATA_EXPORT_CONTENT_TYPE },
  });
  const parts = await getResultAsync(() => uploadParts(upload, archive)).match(
    (uploadedParts) => uploadedParts,
    async (error) => {
      await getResultAsync(() => upload.abort()).match(noop, console.error);
      throw error;
    },
  );
  await upload.complete(parts);
};
