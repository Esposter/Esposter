import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { R2PutOptions } from "#src/models/cloudflare/R2PutOptions";
import type { CloudflareEnvironment, StorageBucket } from "@esposter/db-schema";

import { createR2Transport } from "#src/services/cloudflare/createR2Transport";
import { listBucketObjects } from "@esposter/db";
import { CloudflareAssetType, getCloudflareResourceName } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Throws the refusal a response carries, read as the subject it was asked for
const throwUnlessOk = (response: Response, subject: string): void => {
  if (!response.ok) throw new InvalidOperationError(Operation.Read, subject, `responds ${response.status}`);
};

// One bucket of the account's R2, reached through its S3 API, the one a script can use since a Worker's binding exists
// Only Inside a Worker. The bucket is the one Pulumi created under its environment's name. Requests are signed with the
// Account's R2 token by the shared transport, which bounds how many requests run at once. The payload is left unsigned,
// So a file is Sent without being hashed first
export const createR2BucketClient = (
  environment: CloudflareEnvironment,
  storageBucket: StorageBucket,
): R2BucketClient => {
  const transport = createR2Transport(environment);
  const bucketUrl = `${transport.endpoint}/${getCloudflareResourceName(environment, CloudflareAssetType.R2Bucket, storageBucket)}`;
  // Each segment of a key is encoded on its own, so the slashes that separate a dataset from its hash stay separators
  const getObjectUrl = (key: string): string =>
    `${bucketUrl}/${key
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/")}`;
  return {
    delete: async (key) => {
      const response = await transport.fetch(getObjectUrl(key), { method: "DELETE" });
      // A key already gone is the state a delete asks for, so 404 is not a failure
      if (response.status !== 404) throwUnlessOk(response, key);
    },
    get: async (key) => {
      const response = await transport.fetch(getObjectUrl(key));
      if (response.status === 404) return undefined;
      throwUnlessOk(response, key);
      // Fetch decodes the stored `Content-Encoding: zstd`, so the bytes are the JSON the object was written from
      return Buffer.from(await response.arrayBuffer());
    },
    has: async (key) => {
      const response = await transport.fetch(getObjectUrl(key), { method: "HEAD" });
      if (response.status === 404) return false;
      throwUnlessOk(response, key);
      return true;
    },
    list: (prefix) => listBucketObjects(transport.fetch, bucketUrl, prefix),
    put: async (key, body, { cacheControl, contentEncoding, contentType, createOnly = false }: R2PutOptions = {}) => {
      const headers = new Headers();
      if (cacheControl !== undefined) headers.set("Cache-Control", cacheControl);
      if (contentEncoding !== undefined) headers.set("Content-Encoding", contentEncoding);
      if (contentType !== undefined) headers.set("Content-Type", contentType);
      if (createOnly) headers.set("If-None-Match", "*");
      const response = await transport.fetch(getObjectUrl(key), { body, headers, method: "PUT" });
      // A key taken by an identical write is the state being asked for: 412 is the refusal, 409 a concurrent write of
      // It
      if (createOnly && (response.status === 409 || response.status === 412)) return false;
      throwUnlessOk(response, key);
      return true;
    },
  };
};
