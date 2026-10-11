import type { CanAdmitOptions } from "#src/models/buildCache/CanAdmitOptions";

import { SLOT_MEMORY_DIVISOR, SLOT_RAMP_SECONDS } from "#src/services/buildCache/constants";

// Whether a run may take a slot: free memory above the gate, and the last admitted run ramped or ended. Runs admitted
// Together would all pass the gate on the same free memory and then grow past it as one, so a run waits behind the last
export const checkCanAdmit = ({
  admission,
  freeMemory,
  isProcessAlive,
  now,
  totalMemory,
}: CanAdmitOptions): boolean => {
  if (freeMemory <= totalMemory / SLOT_MEMORY_DIVISOR) return false;
  if (!admission) return true;
  return now - admission.admittedAt >= SLOT_RAMP_SECONDS || !isProcessAlive(admission.admittedPid);
};
