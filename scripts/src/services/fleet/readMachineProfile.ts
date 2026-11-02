import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { MACHINE_PROFILE_PATH } from "#src/services/fleet/constants";
import { parseMachineProfile } from "#src/services/fleet/parseMachineProfile";
import { checkIsNotFound } from "#src/services/shared/checkIsNotFound";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";

// The machine's profile, or undefined when it has none yet or the file is not a profile. A file that exists and cannot be
// Read is an error, not a missing profile, so the read itself decides which it is
export const readMachineProfile = (): MachineProfile | undefined =>
  getResult(() => readFileSync(MACHINE_PROFILE_PATH, "utf8")).match(parseMachineProfile, (error) => {
    if (!checkIsNotFound(error)) throw error;
    return undefined;
  });
