import type { MachineProcess } from "#src/models/machine/MachineProcess";

// A Win32 process's parent is gone when no listed process has its id, or it was reparented to the adopter, which is how
// MacOS hands an orphan to launchd
export const checkIsWin32Orphan = (
  { parentProcessId }: MachineProcess,
  processIds: Set<number>,
  adopterProcessId: number | undefined,
): boolean => !processIds.has(parentProcessId) || parentProcessId === adopterProcessId;
