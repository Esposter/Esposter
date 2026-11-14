import type { Hash } from "node:crypto";

// Passes a blob's chunks on as they arrive, each hashed on the way, so a copy is hashed while it streams and never held whole
export const hashBlobChunks = async function* (body: NodeJS.ReadableStream, hash: Hash): AsyncGenerator<Uint8Array> {
  for await (const chunk of body) {
    hash.update(chunk);
    yield chunk;
  }
};
