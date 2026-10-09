import type { MachineProcess } from "#src/models/machine/MachineProcess";
import type { MsysProcess } from "#src/models/machine/MsysProcess";

import { ORPHAN_CPU_SECONDS, ORPHAN_NAMES } from "#src/services/machine/constants";

// MSYS's init process, which an orphan is reparented to once its parent has gone
const MSYS_INIT_PROCESS_ID = 1;

// A Win32 process's parent is gone when no listed process has its id, or it was reparented to the adopter, which is how
// MacOS hands an orphan to launchd
const checkIsWin32Orphan = (
  { parentProcessId }: MachineProcess,
  processIds: Set<number>,
  adopterProcessId: number | undefined,
): boolean => !processIds.has(parentProcessId) || parentProcessId === adopterProcessId;

// An MSYS process is judged by its MSYS parent, since its Win32 parent may be a short-lived intermediate that has exited
// While the MSYS parent, the bash running the pipeline, still lives. It is an orphan when that MSYS parent is gone or is
// Init, and its Win32 parent is no live process outside MSYS
const checkIsMsysOrphan = (
  { parentProcessId }: MachineProcess,
  { parentProcessId: msysParentProcessId }: MsysProcess,
  processMap: Map<number, MachineProcess>,
  msysProcessIds: Set<number>,
): boolean => {
  if (msysParentProcessId !== MSYS_INIT_PROCESS_ID && msysProcessIds.has(msysParentProcessId)) return false;
  const win32Parent = processMap.get(parentProcessId);
  return win32Parent === undefined || win32Parent.msys !== undefined;
};

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
