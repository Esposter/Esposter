import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { MACHINE_PROFILE_PATH } from "#src/services/fleet/constants";
import { readMachineProfile } from "#src/services/fleet/readMachineProfile";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The profile a command that claims or heartbeats needs: a machine without one has not said what it may take
export const readRequiredMachineProfile = (): MachineProfile => {
  const profile = readMachineProfile();
  if (profile === undefined)
    throw new InvalidOperationError(Operation.Read, MACHINE_PROFILE_PATH, "run pnpm ai:fleet:profile first");
  return profile;
};
