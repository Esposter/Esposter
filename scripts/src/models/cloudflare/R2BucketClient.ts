import type { R2PutOptions } from "#src/models/cloudflare/R2PutOptions";
import type { R2ListedObject } from "@esposter/db";

// One bucket of the account's R2, as a script reads and writes it. Every stored object goes through it, so a test stands an
// In-memory bucket in its place without a network. A missing object reads as undefined, never as an error
export interface R2BucketClient {
  delete: (key: string) => Promise<void>;
  get: (key: string) => Promise<Buffer | undefined>;
  has: (key: string) => Promise<boolean>;
  list: (prefix: string) => Promise<R2ListedObject[]>;
  // Resolves to whether this call wrote the object. A create-only write that finds the key taken is not an error: the
  // Object is already there, so it resolves false
  put: (key: string, body: Blob | Uint8Array<ArrayBuffer>, options?: R2PutOptions) => Promise<boolean>;
}
