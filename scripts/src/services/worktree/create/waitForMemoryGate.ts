import { GATE_MEMORY_SHARE, GIBIBYTE } from "#src/services/machine/constants";
import { readAvailableGigabytes } from "#src/services/machine/readAvailableGigabytes";
import { checkIsMemoryGateOpen } from "#src/services/worktree/create/checkIsMemoryGateOpen";
import { MEMORY_GATE_POLL_MILLISECONDS, MEMORY_GATE_WAIT_MILLISECONDS } from "#src/services/worktree/create/constants";
import { totalmem } from "node:os";
import { setTimeout as sleep } from "node:timers/promises";

// Waits while the free memory is under the gate, sampled every poll, until the wait is spent. An unreadable figure keeps the
// Gate shut. Returns the line that names the shortfall, or none once the gate is open
export const waitForMemoryGate = async (): Promise<string | undefined> => {
  const deadline = Date.now() + MEMORY_GATE_WAIT_MILLISECONDS;
  const totalGigabytes = totalmem() / GIBIBYTE;
  let freeGigabytes = (await readAvailableGigabytes()) ?? 0;
  while (!checkIsMemoryGateOpen(freeGigabytes, totalGigabytes) && Date.now() < deadline) {
    // oxlint-disable-next-line no-await-in-loop -- the gate is sampled again only once its poll interval has passed
    await sleep(MEMORY_GATE_POLL_MILLISECONDS);
    // oxlint-disable-next-line no-await-in-loop -- the figure is read again only after the poll it waited on
    freeGigabytes = (await readAvailableGigabytes()) ?? 0;
  }
  return checkIsMemoryGateOpen(freeGigabytes, totalGigabytes)
    ? undefined
    : `the memory gate is shut: ${freeGigabytes.toFixed(1)} GB free, ${(totalGigabytes * GATE_MEMORY_SHARE).toFixed(1)} GB needed; nothing was created`;
};
