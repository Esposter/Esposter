import type { ObjectStore } from "#src/models/ObjectStore";

import { describe } from "vitest";

export interface MemoryObjectStore extends ObjectStore {
  objects: Map<string, Uint8Array>;
}

// The backend the suites and the bench run against: a map, so the measurement is the codec and never the
// Network
export const createMemoryObjectStore = (objects?: Map<string, Uint8Array>): MemoryObjectStore => {
  const storedObjects = objects ?? new Map<string, Uint8Array>();
  return {
    delete: (keys) => {
      for (const key of keys) storedObjects.delete(key);
      return Promise.resolve();
    },
    objects: storedObjects,
    read: (key) => Promise.resolve(storedObjects.get(key)),
    write: (key, bytes) => {
      if (storedObjects.has(key)) return Promise.resolve(false);

      storedObjects.set(key, bytes);
      return Promise.resolve(true);
    },
  };
};

describe.todo("createMemoryObjectStore");
