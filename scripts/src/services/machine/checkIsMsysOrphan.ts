import type { MachineProcess } from "#src/models/machine/MachineProcess";
import type { MsysProcess } from "#src/models/machine/MsysProcess";

// MSYS's init process, which an orphan is reparented to once its parent has gone
const MSYS_INIT_PROCESS_ID = 1;

// An MSYS process is judged by its MSYS parent, since its Win32 parent may be a short-lived intermediate that has exited
// While the MSYS parent, the bash running the pipeline, still lives. It is an orphan when that MSYS parent is gone or is
// Init, and its Win32 parent is no live process outside MSYS
export const checkIsMsysOrphan = (
  { parentProcessId }: MachineProcess,
  { parentProcessId: msysParentProcessId }: MsysProcess,
  processMap: Map<number, MachineProcess>,
  msysProcessIds: Set<number>,
): boolean => {
  if (msysParentProcessId !== MSYS_INIT_PROCESS_ID && msysProcessIds.has(msysParentProcessId)) return false;
  const win32Parent = processMap.get(parentProcessId);
  return win32Parent === undefined || win32Parent.msys !== undefined;
};
