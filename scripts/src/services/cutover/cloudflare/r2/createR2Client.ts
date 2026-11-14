import type { R2Client } from "#src/models/cutover/R2Client";
import type { R2Credentials } from "#src/models/cutover/R2Credentials";

import { buildR2Url } from "#src/services/cutover/cloudflare/r2/buildR2Url";
import { checkR2Response } from "#src/services/cutover/cloudflare/r2/checkR2Response";
import {
  HTTP_NOT_FOUND,
  R2_CONTENT_TYPE_JSON,
  R2_REGION,
  R2_SERVICE,
  R2_UNSIGNED_PAYLOAD,
} from "#src/services/cutover/cloudflare/r2/constants";
import { parseR2ListObjectsXml } from "#src/services/cutover/cloudflare/r2/parseR2ListObjectsXml";
import { readR2Header } from "#src/services/cutover/cloudflare/r2/readR2Header";
import { sendR2Request } from "#src/services/cutover/cloudflare/r2/sendR2Request";
import { uploadR2Multipart } from "#src/services/cutover/cloudflare/r2/uploadR2Multipart";
import { FETCH_TIMEOUT_MS } from "#src/services/shared/constants";
import { Operation } from "@esposter/shared";
import { AwsClient } from "aws4fetch";

// R2's S3 API, each request signed with the account's keys. A request that gets an answer is checked for its status, and
// one that gets none throws naming its object
export const createR2Client = ({ accessKeyId, accountId, secretAccessKey }: R2Credentials): R2Client => {
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const credentials = { accessKeyId, region: R2_REGION, secretAccessKey, service: R2_SERVICE };
  const client = new AwsClient(credentials);
  // A streamed body can be sent once, and aws4fetch re-sends a request that gets a 5xx, so a streamed PUT never retries.
  // The step fails and a re-run redoes it, skipping what is already stored
  const streamClient = new AwsClient({ ...credentials, retries: 0 });

  return {
    async deleteObject(bucket, key) {
      const url = buildR2Url(endpoint, bucket, key, {});
      const response = await sendR2Request(client, Operation.Delete, key, url, {
        method: "DELETE",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      await checkR2Response(response, Operation.Delete, key);
    },
    async getText(bucket, key) {
      const url = buildR2Url(endpoint, bucket, key, {});
      const response = await sendR2Request(client, Operation.Read, key, url, {
        method: "GET",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (response.status === HTTP_NOT_FOUND) {
        await response.text();
        return undefined;
      }
      await checkR2Response(response, Operation.Read, key);
      return response.text();
    },
    async headObject(bucket, key) {
      const url = buildR2Url(endpoint, bucket, key, {});
      const response = await sendR2Request(client, Operation.Read, key, url, {
        method: "HEAD",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (response.status === HTTP_NOT_FOUND) return undefined;
      await checkR2Response(response, Operation.Read, key);
      return {
        etag: readR2Header(response, "etag", Operation.Read, key).replaceAll('"', ""),
        key,
        size: Number(readR2Header(response, "content-length", Operation.Read, key)),
      };
    },
    async *listObjects(bucket) {
      let continuationToken = "";
      do {
        const query =
          continuationToken === ""
            ? { "list-type": "2" }
            : { "continuation-token": continuationToken, "list-type": "2" };
        const url = buildR2Url(endpoint, bucket, "", query);
        const response = await sendR2Request(client, Operation.Read, bucket, url, {
          method: "GET",
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        await checkR2Response(response, Operation.Read, bucket);
        const page = parseR2ListObjectsXml(await response.text());
        yield* page.objects;
        continuationToken = page.nextContinuationToken;
      } while (continuationToken !== "");
    },
    async putStream(bucket, key, body, options) {
      const headers = new Headers({
        "content-length": String(options.size),
        "x-amz-content-sha256": R2_UNSIGNED_PAYLOAD,
      });
      if (options.cacheControl) headers.set("cache-control", options.cacheControl);
      if (options.contentDisposition) headers.set("content-disposition", options.contentDisposition);
      if (options.contentType) headers.set("content-type", options.contentType);
      const url = buildR2Url(endpoint, bucket, key, {});
      const response = await sendR2Request(streamClient, Operation.Create, key, url, { body, headers, method: "PUT" });
      await checkR2Response(response, Operation.Create, key);
      return readR2Header(response, "etag", Operation.Create, key).replaceAll('"', "");
    },
    async putText(bucket, key, text) {
      const url = buildR2Url(endpoint, bucket, key, {});
      const response = await sendR2Request(client, Operation.Create, key, url, {
        body: text,
        headers: { "content-type": R2_CONTENT_TYPE_JSON },
        method: "PUT",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      await checkR2Response(response, Operation.Create, key);
    },
    async uploadMultipart(bucket, key, chunks) {
      await uploadR2Multipart(client, endpoint, bucket, key, chunks);
    },
  };
};
