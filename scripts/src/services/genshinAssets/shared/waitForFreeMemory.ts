import { MEMORY_WAIT_MILLISECONDS, MIN_AVAILABLE_MEMORY_GIGABYTES } from "#src/services/genshinAssets/world/constants";
import { readAvailableGigabytes } from "#src/services/machine/readAvailableGigabytes";
import { setTimeout as sleep } from "node:timers/promises";

// Waits while the available memory is under the floor, so a run starts only with room for its blocks. Available, not
// Free: macOS's free figure leaves out the memory it hands back on demand, so a gate on it waits with gigabytes to spare
export const waitForFreeMemory = async (): Promise<void> => {
  for (;;) {
    // oxlint-disable-next-line no-await-in-loop -- Polling: each reading is taken after the last wait, so the waits cannot overlap
    const freeGigabytes = await readAvailableGigabytes();
    // A gauge that cannot be read would stall the run forever, so the run starts without the gate
    if (freeGigabytes === undefined) {
      console.warn("available memory could not be read, so the run starts without waiting for it");
      return;
    }
    if (freeGigabytes >= MIN_AVAILABLE_MEMORY_GIGABYTES) return;
    // oxlint-disable-next-line no-await-in-loop -- As above
    await sleep(MEMORY_WAIT_MILLISECONDS);
  }
};
