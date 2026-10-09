import { MEMORY_WAIT_MILLISECONDS, MIN_FREE_MEMORY_BYTES } from "#src/services/genshinAssets/world/constants";
import { freemem } from "node:os";
import { setTimeout as sleep } from "node:timers/promises";

// Waits while the free physical memory is under the floor, so a run starts only with room for its blocks
export const waitForFreeMemory = async (): Promise<void> => {
  while (freemem() < MIN_FREE_MEMORY_BYTES) await sleep(MEMORY_WAIT_MILLISECONDS);
};
