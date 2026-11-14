import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { R2ListedObject } from "#src/models/cloudflare/R2ListedObject";
import type { R2PutOptions } from "#src/models/cloudflare/R2PutOptions";
import type { CloudflareEnvironment, StorageBucket } from "@esposter/db-schema";

import { createR2Transport } from "#src/services/cloudflare/createR2Transport";
import { R2_REQUEST_TIMEOUT_MS } from "#src/services/cloudflare/constants";
import { parseListBucketResult } from "#src/services/cloudflare/parseListBucketResult";
import { CloudflareAssetType, getCloudflareResourceName } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Throws the refusal a response carries, read as the subject it was asked for
const throwUnlessOk = (response: Response, subject: string): void => {
  if (!response.ok) throw new InvalidOperationError(Operation.Read, subject, `responds ${response.status}`);
};

// One bucket of the account's R2, reached through its S3 API, the one a script can use since a Worker's binding exists only
// Inside a Worker. The bucket is the one Pulumi created under its environment's name. Requests are signed with the account's
// R2 token, and each carries its own timeout. aws4fetch signs an S3 body as UNSIGNED-PAYLOAD, so a file streams unhashed
export const createR2BucketClient = (
  environment: CloudflareEnvironment,
  storageBucket: StorageBucket,
): R2BucketClient => {
  const transport = createR2Transport();
  const bucketUrl = `${transport.endpoint}/${getCloudflareResourceName(environment, CloudflareAssetType.R2Bucket, storageBucket)}`;
  // Each segment of a key is encoded on its own, so the slashes that separate a dataset from its hash stay separators
  const getObjectUrl = (key: string): string =>
    `${bucketUrl}/${key
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/")}`;
  const send = (url: string, init: RequestInit = {}): Promise<Response> =>
    transport.fetch(url, { ...init, signal: AbortSignal.timeout(R2_REQUEST_TIMEOUT_MS) });
  // A ListObjectsV2 page and the pages after it, each one following the token the last one returned
  const listPage = async (prefix: string, continuationToken?: string): Promise<R2ListedObject[]> => {
    const url = new URL(bucketUrl);
    url.searchParams.set("list-type", "2");
    url.searchParams.set("prefix", prefix);
    if (continuationToken !== undefined) url.searchParams.set("continuation-token", continuationToken);
    const response = await send(url.toString());
    throwUnlessOk(response, url.toString());
    const page = parseListBucketResult(await response.text());
    return page.nextContinuationToken === undefined
      ? page.objects
      : [...page.objects, ...(await listPage(prefix, page.nextContinuationToken))];
  };

  return {
    delete: async (key) => {
      const response = await send(getObjectUrl(key), { method: "DELETE" });
      // A key already gone is the state a delete asks for, so 404 is not a failure
      if (response.status !== 404) throwUnlessOk(response, key);
    },
    get: async (key) => {
      const response = await send(getObjectUrl(key));
      if (response.status === 404) return undefined;
      throwUnlessOk(response, key);
      // Fetch decodes the stored `Content-Encoding: zstd`, so the bytes are the JSON the object was written from
      return Buffer.from(await response.arrayBuffer());
    },
    has: async (key) => {
      const response = await send(getObjectUrl(key), { method: "HEAD" });
      if (response.status === 404) return false;
      throwUnlessOk(response, key);
      return true;
    },
    list: (prefix) => listPage(prefix),
    put: async (key, body, { cacheControl, contentEncoding, contentType, createOnly = false }: R2PutOptions = {}) => {
      const headers = new Headers();
      if (cacheControl !== undefined) headers.set("Cache-Control", cacheControl);
      if (contentEncoding !== undefined) headers.set("Content-Encoding", contentEncoding);
      if (contentType !== undefined) headers.set("Content-Type", contentType);
      if (createOnly) headers.set("If-None-Match", "*");
      const response = await send(getObjectUrl(key), { body, headers, method: "PUT" });
      // A key taken by an identical write is the state being asked for: 412 is the refusal, 409 a concurrent write of it
      if (createOnly && (response.status === 409 || response.status === 412)) return false;
      throwUnlessOk(response, key);
      return true;
    },
  };
};
