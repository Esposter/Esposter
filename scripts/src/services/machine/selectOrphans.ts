import type { MachineProcess } from "#src/models/machine/MachineProcess";

import { ORPHAN_CPU_SECONDS, ORPHAN_NAMES } from "#src/services/machine/constants";

// A search or size scan whose parent is gone has no reader left. Its parent is gone when no listed process has its id,
// Or when it was reparented to the adopter, which is how macOS hands an orphan to launchd.
export const selectOrphans = (processes: MachineProcess[], adopterProcessId: number | undefined): MachineProcess[] => {
  const processIds = new Set(processes.map(({ processId }) => processId));
  return processes.filter(
    ({ cpuSeconds, name, parentProcessId }) =>
      ORPHAN_NAMES.includes(name) &&
      (!processIds.has(parentProcessId) || parentProcessId === adopterProcessId) &&
      cpuSeconds > ORPHAN_CPU_SECONDS,
  );
};
