import type { R2Transport } from "#src/models/cloudflare/R2Transport";

import { buildR2Url } from "#src/services/cutover/cloudflare/r2/buildR2Url";
import { checkR2Response } from "#src/services/cutover/cloudflare/r2/checkR2Response";
import { readR2Header } from "#src/services/cutover/cloudflare/r2/readR2Header";
import { sendR2Request } from "#src/services/cutover/cloudflare/r2/sendR2Request";
import { Operation } from "@esposter/shared";

// One part of a multipart upload. Resolves to the ETag R2 gave it, which the completion names the part by
export const uploadR2Part = async (
  transport: R2Transport,
  endpoint: string,
  bucket: string,
  key: string,
  uploadId: string,
  partNumber: number,
  body: Uint8Array<ArrayBuffer>,
): Promise<string> => {
  const url = buildR2Url(endpoint, bucket, key, { partNumber: String(partNumber), uploadId });
  const response = await sendR2Request(transport, Operation.Create, key, url, { body, method: "PUT" });
  await checkR2Response(response, Operation.Create, key);
  return readR2Header(response, "etag", Operation.Create, key);
};
