import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { R2PutOptions } from "#src/models/cloudflare/R2PutOptions";

import { brotliDecompressSync, zstdDecompressSync } from "node:zlib";
import { describe } from "vitest";

// The bytes a read returns for a stored object, decoded by its Content-Encoding as R2 serves it through `fetch`
const decodeStored = (bytes: Uint8Array, contentEncoding: string | undefined): Buffer => {
  if (contentEncoding === "br") return brotliDecompressSync(bytes);
  if (contentEncoding === "zstd") return zstdDecompressSync(bytes);
  return Buffer.from(bytes);
};

// An in-memory bucket with the semantics the scripts rely on: a write stamps the instant it lands, read from the clock a
// Test fakes, a create-only write refuses a key already taken, and a read decodes a stored `br` or `zstd` object as R2
// Serves it through `fetch`. It stands in for the S3 client wherever a test writes
export const createMemoryR2BucketClient = () => {
  const store = new Map<
    string,
    {
      body: Blob | Uint8Array<ArrayBuffer>;
      contentEncoding?: string | undefined;
      contentType?: string | undefined;
      lastModified: Date;
    }
  >();
  const client: R2BucketClient = {
    delete: (key) => {
      store.delete(key);
      return Promise.resolve();
    },
    get: async (key) => {
      const stored = store.get(key);
      if (stored === undefined) return undefined;
      const bytes = stored.body instanceof Blob ? new Uint8Array(await stored.body.arrayBuffer()) : stored.body;
      return decodeStored(bytes, stored.contentEncoding);
    },
    has: (key) => Promise.resolve(store.has(key)),
    list: (prefix) =>
      Promise.resolve(
        [...store].filter(([key]) => key.startsWith(prefix)).map(([key, { lastModified }]) => ({ key, lastModified })),
      ),
    put: (key, body, { contentEncoding, contentType, createOnly = false }: R2PutOptions = {}) => {
      if (createOnly && store.has(key)) return Promise.resolve(false);
      store.set(key, { body, contentEncoding, contentType, lastModified: new Date() });
      return Promise.resolve(true);
    },
  };
  return { ...client, store };
};

describe.todo("createMemoryR2BucketClient");
