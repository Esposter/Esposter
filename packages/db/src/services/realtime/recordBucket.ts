import type { RecordedBlobs } from "#src/models/realtime/RecordedBlobs";
import type { R2Bucket } from "@cloudflare/workers-types";

import { getBlobWriteTopics } from "#src/services/realtime/getBlobWriteTopics";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { getBlobListTopic, getBlobTopic } from "@esposter/db-schema";

// The keys a delete names, which R2 takes as one key or a list of them
const getDeletedKeys = (keys: unknown): string[] => {
  if (typeof keys === "string") return [keys];
  return Array.isArray(keys) ? keys.filter((key): key is string => typeof key === "string") : [];
};

// Records the reads and writes of a bucket binding into the blobs the scope holds when the call runs, and nothing outside one.
// A read names the key it reads or the directory a listing lies in, and a write publishes the topics of the key it changes
const recordCall = (method: string | symbol, args: unknown[], bucket: string, blobs: RecordedBlobs) => {
  const [first] = args;
  if (method === "get" || method === "head") {
    if (typeof first === "string") blobs.reads.push(getBlobTopic(bucket, first));
  } else if (method === "list") {
    const prefix = checkIsRecord(first) && typeof first.prefix === "string" ? first.prefix : "";
    blobs.reads.push(getBlobListTopic(bucket, prefix));
  } else if (method === "put") {
    if (typeof first === "string") blobs.writes.push(...getBlobWriteTopics(bucket, first));
  } else if (method === "delete")
    for (const key of getDeletedKeys(first)) blobs.writes.push(...getBlobWriteTopics(bucket, key));
};

export const recordBucket = (bucket: R2Bucket, name: string, getBlobs: () => RecordedBlobs | undefined): R2Bucket =>
  new Proxy(bucket, {
    get: (target, property) => {
      const value: unknown = Reflect.get(target, property, target);
      if (typeof value !== "function") return value;
      return (...args: unknown[]) => {
        const blobs = getBlobs();
        if (blobs) recordCall(property, args, name, blobs);
        return Reflect.apply(value, target, args);
      };
    },
  });
