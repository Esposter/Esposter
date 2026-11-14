import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";

import { zstdDecompressSync } from "node:zlib";
import { describe } from "vitest";

// An in-memory bucket with the semantics the scripts rely on: a write stamps the instant it lands, read from the clock a
// Test fakes, a create-only write refuses a key already taken, and a read decodes a `zstd` object as R2 serves it through
// `fetch`. It stands in for the S3 client wherever a test writes
export const createMemoryR2BucketClient = () => {
  const store = new Map<string, { body: Blob | Uint8Array; contentEncoding?: string; lastModified: Date }>();
  const client: R2BucketClient = {
    delete: (key) => {
      store.delete(key);
      return Promise.resolve();
    },
    get: async (key) => {
      const stored = store.get(key);
      if (stored === undefined) return undefined;
      const bytes = stored.body instanceof Blob ? await stored.body.arrayBuffer() : stored.body;
      return stored.contentEncoding === "zstd" ? zstdDecompressSync(bytes) : Buffer.from(bytes);
    },
    has: (key) => Promise.resolve(store.has(key)),
    list: (prefix) =>
      Promise.resolve(
        [...store].filter(([key]) => key.startsWith(prefix)).map(([key, { lastModified }]) => ({ key, lastModified })),
      ),
    put: (key, body, { contentEncoding, createOnly = false } = {}) => {
      if (createOnly && store.has(key)) return Promise.resolve(false);
      store.set(key, { body, contentEncoding, lastModified: new Date() });
      return Promise.resolve(true);
    },
  };
  return { ...client, store };
};

describe.todo("createMemoryR2BucketClient");
