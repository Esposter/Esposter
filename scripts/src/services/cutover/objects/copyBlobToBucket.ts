import type { BlobEntry } from "#src/models/cutover/BlobEntry";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { R2Client } from "#src/models/cutover/R2Client";
import type { ContainerClient } from "@azure/storage-blob";

import { downloadBlobBody } from "#src/services/cutover/azure/downloadBlobBody";
import { MD5_ALGORITHM } from "#src/services/cutover/constants";
import { checkIsTextualBlob } from "#src/services/cutover/objects/checkIsTextualBlob";
import { hashBlobChunks } from "#src/services/cutover/objects/hashBlobChunks";
import { readBlobText } from "#src/services/cutover/objects/readBlobText";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

// The chunks as the web stream R2's client takes, each pulled only when the upload asks for it, so nothing is read ahead of the upload
const toWebStream = (chunks: AsyncIterable<Uint8Array> | Iterable<Uint8Array>): ReadableStream<Uint8Array> => {
  const iterator = (async function* () {
    yield* chunks;
  })();
  return new ReadableStream<Uint8Array>({
    async cancel(reason) {
      await iterator.return(reason);
    },
    async pull(controller) {
      const { done, value } = await iterator.next();
      if (done) controller.close();
      else controller.enqueue(value);
    },
  });
};

// Streams one blob into its R2 object under the key the id map gives it, hashing the bytes as they pass.
// A textual blob is read whole and written with every old UUID in it replaced by its new id.
// R2 answers the PUT with the MD5 it stored, which must be the one the bytes hashed to
export const copyBlobToBucket = async (
  client: R2Client,
  containerClient: ContainerClient,
  bucket: string,
  blob: BlobEntry,
  key: string,
  idMap: IdMap,
): Promise<void> => {
  const body = await downloadBlobBody(containerClient, blob.name);
  const hash = createHash(MD5_ALGORITHM);
  const options = {
    cacheControl: blob.cacheControl,
    contentDisposition: blob.contentDisposition,
    contentType: blob.contentType,
    size: blob.size,
  };
  let storedEtag: string;
  if (checkIsTextualBlob(blob)) {
    const bytes = Buffer.from(idMap.rewrite(await readBlobText(body)), "utf8");
    hash.update(bytes);
    storedEtag = await client.putStream(bucket, key, toWebStream([bytes]), { ...options, size: bytes.byteLength });
  } else storedEtag = await client.putStream(bucket, key, toWebStream(hashBlobChunks(body, hash)), options);
  const md5 = hash.digest("hex");
  if (storedEtag !== md5)
    throw new InvalidOperationError(
      Operation.Create,
      blob.name,
      `was stored with ETag ${storedEtag}, not the MD5 ${md5} of its bytes`,
    );
};
