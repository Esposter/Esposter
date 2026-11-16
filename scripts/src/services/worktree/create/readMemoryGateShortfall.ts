import { checkIsMemoryGateOpen } from "#src/services/machine/checkIsMemoryGateOpen";
import { GATE_MEMORY_SHARE, GIBIBYTE } from "#src/services/machine/constants";
import { readAvailableGigabytes } from "#src/services/machine/readAvailableGigabytes";
import { totalmem } from "node:os";

// The line that names the free memory's shortfall under the gate, or none while the gate is open. It is read once: no
// Signal says when memory frees up, so a shut gate is answered at once and the session that asked decides what to do
// Next, rather than this command sampling a gauge. An unreadable figure keeps the gate shut
export const readMemoryGateShortfall = async (): Promise<string | undefined> => {
  const totalGigabytes = totalmem() / GIBIBYTE;
  const freeGigabytes = (await readAvailableGigabytes()) ?? 0;
  return checkIsMemoryGateOpen(freeGigabytes, totalGigabytes)
    ? undefined
    : `the memory gate is shut: ${freeGigabytes.toFixed(1)} GB free, ${(totalGigabytes * GATE_MEMORY_SHARE).toFixed(1)} GB needed; nothing was created`;
};
