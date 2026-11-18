import { describe, vi } from "vitest";

// The reads resolve in microtasks, and a read that imports its module first resolves once the import has settled, so once
// Those have settled and a macrotask has passed, every read has landed in its refs
export const flushReads = async () => {
  await vi.dynamicImportSettled();
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

describe.todo("flushReads");
