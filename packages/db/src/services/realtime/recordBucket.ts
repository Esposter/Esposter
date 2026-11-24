import type { RecordedBlobs } from "#src/models/realtime/RecordedBlobs";
import type { R2Bucket, R2MultipartUpload } from "@cloudflare/workers-types";

import { getBlobListTopic } from "#src/services/realtime/getBlobListTopic";
import { recordBlobWrite } from "#src/services/realtime/recordBlobWrite";
import { getBlobTopic } from "@esposter/db-schema";
import { checkIsRecord } from "@esposter/shared";

// The keys a delete names, which R2 takes as one key or a list of them
const getDeletedKeys = (keys: unknown): string[] => {
  if (typeof keys === "string") return [keys];
  return Array.isArray(keys) ? keys.filter((key): key is string => typeof key === "string") : [];
};

// Records the reads and writes of a bucket binding into the blobs the scope holds when the call runs, and nothing
// Outside one. A read names the key it reads or the directory a listing lies in, and a write publishes the topics of
// The key it changes
const recordCall = (method: string | symbol, args: unknown[], bucket: string, blobs: RecordedBlobs) => {
  const [first] = args;
  if (method === "get" || method === "head") {
    if (typeof first === "string") blobs.reads.push(getBlobTopic(bucket, first));
  } else if (method === "list") {
    const prefix = checkIsRecord(first) && typeof first.prefix === "string" ? first.prefix : "";
    blobs.reads.push(getBlobListTopic(bucket, prefix));
  } else if (method === "put") {
    if (typeof first === "string") recordBlobWrite(blobs, bucket, first);
  } else if (method === "delete") for (const key of getDeletedKeys(first)) recordBlobWrite(blobs, bucket, key);
};

// A multipart upload writes its object when it completes, so the completion is recorded as the write of the key the
// Upload was created for, as a put is. Its other methods add parts to an object that does not exist yet, so they record
// Nothing
const recordUpload = (
  upload: R2MultipartUpload,
  key: string,
  bucket: string,
  getBlobs: () => RecordedBlobs | undefined,
): R2MultipartUpload =>
  new Proxy(upload, {
    get: (target, property) => {
      const value: unknown = Reflect.get(target, property, target);
      if (typeof value !== "function") return value;
      return (...args: unknown[]) => {
        const blobs = getBlobs();
        if (property === "complete") recordBlobWrite(blobs, bucket, key);
        return Reflect.apply(value, target, args);
      };
    },
  });

export const recordBucket = (bucket: R2Bucket, name: string, getBlobs: () => RecordedBlobs | undefined): R2Bucket =>
  new Proxy(bucket, {
    get: (target, property) => {
      const value: unknown = Reflect.get(target, property, target);
      if (typeof value !== "function") return value;
      if (property === "createMultipartUpload")
        return async (...args: unknown[]) => {
          const upload: R2MultipartUpload = await Reflect.apply(value, target, args);
          const [key] = args;
          return typeof key === "string" ? recordUpload(upload, key, name, getBlobs) : upload;
        };
      return (...args: unknown[]) => {
        const blobs = getBlobs();
        if (blobs) recordCall(property, args, name, blobs);
        return Reflect.apply(value, target, args);
      };
    },
  });
