import { getPerformanceCoreCount } from "#src/services/genshinAssets/shared/getPerformanceCoreCount";
import { readAvailableGigabytes } from "#src/services/machine/readAvailableGigabytes";
import { ANIMESTUDIO_RUN_MEMORY_GIGABYTES } from "#src/services/recreation/animeStudio/constants";

// The shards a map runs at once: one per performance core, as many as the available memory holds a run for, and at least
// One. The memory is read once before any run starts, so the runs fit the machine as it is rather than each waiting on a
// Gauge for room the others are about to take. A gauge that cannot be read leaves the cores as the bound
export const getMemoryBoundedShardCount = async (): Promise<number> => {
  const coreCount = getPerformanceCoreCount();
  const availableGigabytes = await readAvailableGigabytes();
  if (availableGigabytes === undefined) return coreCount;
  return Math.max(1, Math.min(coreCount, Math.floor(availableGigabytes / ANIMESTUDIO_RUN_MEMORY_GIGABYTES)));
};
