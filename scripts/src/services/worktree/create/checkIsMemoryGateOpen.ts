import { GATE_MEMORY_SHARE } from "#src/services/machine/constants";

// The gate is a share of the machine's own RAM, the same share the watcher reads, so a bigger machine waits no longer
// Than a smaller one does for the same headroom
export const checkIsMemoryGateOpen = (freeGigabytes: number, totalGigabytes: number): boolean =>
  freeGigabytes >= totalGigabytes * GATE_MEMORY_SHARE;
