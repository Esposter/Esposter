import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import type { AwsClient } from "aws4fetch";

import { buildR2Url } from "#src/services/cutover/cloudflare/r2/buildR2Url";
import { checkR2Response } from "#src/services/cutover/cloudflare/r2/checkR2Response";
import { readXmlElement } from "#src/services/cutover/cloudflare/r2/readXmlElement";
import { sendR2Request } from "#src/services/cutover/cloudflare/r2/sendR2Request";
import { uploadR2Part } from "#src/services/cutover/cloudflare/r2/uploadR2Part";
import { R2_MULTIPART_PART_BYTES } from "#src/services/cutover/constants";
import { FETCH_TIMEOUT_MS } from "#src/services/shared/constants";

// An object of unknown length, sent in parts of at least R2_MULTIPART_PART_BYTES, each held in memory until it is sent. A
// failure aborts the upload, so no part is left stored and billed. An abort that fails too is logged, and the error that
// caused the abort is what the caller sees
export const uploadR2Multipart = async (
  client: AwsClient,
  endpoint: string,
  bucket: string,
  key: string,
  chunks: AsyncIterable<Uint8Array>,
): Promise<void> => {
  const createUrl = buildR2Url(endpoint, bucket, key, { uploads: "" });
  const created = await sendR2Request(client, Operation.Create, key, createUrl, {
    method: "POST",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  await checkR2Response(created, Operation.Create, key);
  const uploadId = readXmlElement(await created.text(), "UploadId");
  if (uploadId === "") throw new InvalidOperationError(Operation.Create, key, "was given no upload id");

  await getResultAsync(async () => {
    const etags: string[] = [];
    let buffered: Uint8Array[] = [];
    let bufferedBytes = 0;
    for await (const chunk of chunks) {
      buffered.push(chunk);
      bufferedBytes += chunk.byteLength;
      if (bufferedBytes < R2_MULTIPART_PART_BYTES) continue;
      // oxlint-disable-next-line no-await-in-loop -- parts are numbered in the order they are sent, so each waits for the one before
      etags.push(await uploadR2Part(client, endpoint, bucket, key, uploadId, etags.length + 1, Buffer.concat(buffered)));
      buffered = [];
      bufferedBytes = 0;
    }
    // The last part may be short, and an empty object still needs one part
    if (bufferedBytes > 0 || etags.length === 0)
      etags.push(await uploadR2Part(client, endpoint, bucket, key, uploadId, etags.length + 1, Buffer.concat(buffered)));

    const partsXml = etags.map((etag, index) => `<Part><PartNumber>${index + 1}</PartNumber><ETag>${etag}</ETag></Part>`);
    const completeUrl = buildR2Url(endpoint, bucket, key, { uploadId });
    const completed = await sendR2Request(client, Operation.Create, key, completeUrl, {
      body: `<CompleteMultipartUpload>${partsXml.join("")}</CompleteMultipartUpload>`,
      method: "POST",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    await checkR2Response(completed, Operation.Create, key);
    // S3 can answer a failed completion with a 200 whose body is an Error, so the body is read as well
    const completion = await completed.text();
    if (completion.includes("<Error>"))
      throw new InvalidOperationError(Operation.Create, key, `was not completed: ${readXmlElement(completion, "Code")}`);
  }).match(noop, async (error) => {
    await getResultAsync(async () => {
      const abortUrl = buildR2Url(endpoint, bucket, key, { uploadId });
      const aborted = await sendR2Request(client, Operation.Delete, key, abortUrl, {
        method: "DELETE",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      await checkR2Response(aborted, Operation.Delete, key);
    }).match(noop, (abortError) => {
      console.error(`${key}'s multipart upload was not aborted: ${abortError.message}`);
    });
    throw error;
  });
};
