import type { ObjectStore } from "#src/models/ObjectStore";

import { describe } from "vitest";

export interface MemoryObjectStore extends ObjectStore {
  objects: Map<string, Uint8Array>;
}

// The backend the suites and the bench run against: a map, so the measurement is the codec and never the
// Network. Serves a head read by slicing, exactly as a ranged download would
export const createMemoryObjectStore = (objects: Map<string, Uint8Array> = new Map()): MemoryObjectStore => ({
  delete: (keys) => {
    for (const key of keys) objects.delete(key);
    return Promise.resolve();
  },
  objects,
  read: (key, byteCount) => {
    const bytes = objects.get(key);
    return Promise.resolve(byteCount === undefined ? bytes : bytes?.subarray(0, byteCount));
  },
  write: (key, bytes) => {
    objects.set(key, bytes);
    return Promise.resolve();
  },
});

describe.todo("createMemoryObjectStore");
