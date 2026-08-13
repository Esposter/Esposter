import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { flushPromises } from "@vue/test-utils";
import { describe } from "vitest";

// The cache's reads and writes are fire-and-forget through getSynchronizedFunction, so its completion signal is
// The drain for those — flushPromises first, because the write is fired from a post-flush watcher
export const flushCache = async () => {
  await flushPromises();
  await waitForSynchronizedFunctions();
};

describe.todo("flushCache");
