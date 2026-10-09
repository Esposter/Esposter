import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { MACHINE_PROFILE_PATH } from "#src/services/fleet/constants";
import { parseMachineProfile } from "#src/services/fleet/parseMachineProfile";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, readFileSync } from "node:fs";

// The machine's profile, or undefined when it has none yet or the file is not a profile
export const readMachineProfile = (): MachineProfile | undefined =>
  existsSync(MACHINE_PROFILE_PATH)
    ? getResult(() => readFileSync(MACHINE_PROFILE_PATH, "utf8")).match(parseMachineProfile, () => undefined)
    : undefined;

// The profile a command that claims or heartbeats needs: a machine without one has not said what it may take
export const readRequiredMachineProfile = (): MachineProfile => {
  const profile = readMachineProfile();
  if (profile === undefined)
    throw new InvalidOperationError(Operation.Read, MACHINE_PROFILE_PATH, "run pnpm ai:fleet:profile first");
  return profile;
};
