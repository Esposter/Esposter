import type { ResourceInResource } from "@esposter/db-schema";

import { getStagingContentBlobName } from "#server/services/resource/getStagingContentBlobName";
import { getBucket } from "#server/services/storage/getBucket";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { StorageBucket, DatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";

// The inflation is counted as it streams, so an archive that expands past the content limit stops at the chunk it
// Crosses rather than filling the heap; leaving the loop cancels the stream, so nothing past it is inflated
const gunzipWithinLimit = async (compressedContent: Uint8Array<ArrayBuffer>) => {
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let length = 0;
  for await (const chunk of new Blob([compressedContent]).stream().pipeThrough(new DecompressionStream("gzip"))) {
    length += chunk.byteLength;
    if (length > MAX_RESOURCE_CONTENT_SIZE) throw new RangeError(`inflated past ${MAX_RESOURCE_CONTENT_SIZE} bytes`);
    chunks.push(chunk);
  }
  return new Blob(chunks).text();
};
// A write SAS carries no length, so the staged bytes are measured here rather than trusted: the size before the
// Download is allocated, the hash against what the client says it uploaded, and the inflation capped so a small
// Archive that expands past the content limit stops at it instead of filling the heap. The gzip of a document
// Under the limit is smaller than the document, so the limit bounds both
export const readStagedResourceContent = async (id: ResourceInResource["id"], hash: string): Promise<unknown> => {
  const bucket = getBucket(StorageBucket.ResourceAssets);
  const blobName = getStagingContentBlobName(id);
  const stagedObject = await bucket.head(blobName);
  if (!stagedObject)
    throw getInvalidOperationError(Operation.Update, DatabaseEntityType.Resource, "no staged content to commit");

  const { etag, size: contentLength } = stagedObject;
  if (contentLength > MAX_RESOURCE_CONTENT_SIZE)
    throw getInvalidOperationError(
      Operation.Update,
      DatabaseEntityType.Resource,
      `staged content is larger than ${MAX_RESOURCE_CONTENT_SIZE} bytes`,
    );

  const hashMismatchError = getInvalidOperationError(
    Operation.Update,
    DatabaseEntityType.Resource,
    "staged content does not match its hash",
  );
  // A mismatch is another device's upload landing on the same name between this one's PUT and its commit, which reads as
  // the same mismatch rather than as bytes the measurement did not describe. The object read back names the etag it holds,
  // so one that is not the measured version is refused before its bytes are read, and a blob gone since the measurement
  // answers nothing; both take the mismatch path. The etag is compared rather than probed for a body, since probing a
  // body's presence consumes it under the local emulator
  const compressedObject = await bucket.get(blobName);
  if (compressedObject?.etag !== etag) throw hashMismatchError;

  const compressedContent = new Uint8Array(await compressedObject.arrayBuffer());
  if (createHash("sha256").update(compressedContent).digest("hex") !== hash) throw hashMismatchError;

  const serializedContent = await getResultAsync(() => gunzipWithinLimit(compressedContent)).match(
    (content) => content,
    () => {
      throw getInvalidOperationError(
        Operation.Update,
        DatabaseEntityType.Resource,
        `staged content is not a gzip of at most ${MAX_RESOURCE_CONTENT_SIZE} bytes`,
      );
    },
  );
  // oxlint-disable-next-line no-restricted-properties -- the content schema owns date coercion, so free-text ISO strings survive
  return JSON.parse(serializedContent);
};
