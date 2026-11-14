import type { Hash } from "node:crypto";

import { Buffer } from "node:buffer";

// Passes a blob's chunks on as they arrive, each hashed on the way, so a copy is hashed while it streams and never held whole
export const hashBlobChunks = async function* (body: NodeJS.ReadableStream, hash: Hash): AsyncGenerator<Uint8Array> {
  for await (const chunk of body) {
    const bytes = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    hash.update(bytes);
    yield bytes;
  }
};
