import { Operation } from "@esposter/shared";
import type { AwsClient } from "aws4fetch";

import { buildR2Url } from "#src/services/cutover/cloudflare/r2/buildR2Url";
import { checkR2Response } from "#src/services/cutover/cloudflare/r2/checkR2Response";
import { readR2Header } from "#src/services/cutover/cloudflare/r2/readR2Header";
import { sendR2Request } from "#src/services/cutover/cloudflare/r2/sendR2Request";

// One part of a multipart upload. Resolves to the ETag R2 gave it, which the completion names the part by
export const uploadR2Part = async (
  client: AwsClient,
  endpoint: string,
  bucket: string,
  key: string,
  uploadId: string,
  partNumber: number,
  body: Uint8Array,
): Promise<string> => {
  const url = buildR2Url(endpoint, bucket, key, { partNumber: String(partNumber), uploadId });
  const response = await sendR2Request(client, Operation.Create, key, url, { body, method: "PUT" });
  await checkR2Response(response, Operation.Create, key);
  return readR2Header(response, "etag", Operation.Create, key);
};
