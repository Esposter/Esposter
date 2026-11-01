import type { MachineProcess } from "#src/models/machine/MachineProcess";

import { checkIsMsysOrphan } from "#src/services/machine/checkIsMsysOrphan";
import { checkIsWin32Orphan } from "#src/services/machine/checkIsWin32Orphan";
import { ORPHAN_CPU_SECONDS, ORPHAN_NAMES } from "#src/services/machine/constants";

// A search or size scan whose parent is gone has no reader left, so it is selected once it has burnt its CPU threshold
export const selectOrphans = (processes: MachineProcess[], adopterProcessId: number | undefined): MachineProcess[] => {
  const processIds = new Set(processes.map(({ processId }) => processId));
  const processMap = new Map(processes.map((process) => [process.processId, process]));
  const msysProcessIds = new Set(processes.flatMap(({ msys }) => (msys === undefined ? [] : [msys.processId])));
  return processes.filter((process) => {
    const isOrphan =
      process.msys === undefined
        ? checkIsWin32Orphan(process, processIds, adopterProcessId)
        : checkIsMsysOrphan(process, process.msys, processMap, msysProcessIds);
    return ORPHAN_NAMES.includes(process.name) && isOrphan && process.cpuSeconds > ORPHAN_CPU_SECONDS;
  });
};
