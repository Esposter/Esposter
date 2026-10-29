import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { MACHINE_PROFILE_PATH } from "#src/services/fleet/constants";
import { parseMachineProfile } from "#src/services/fleet/parseMachineProfile";
import { getResult } from "@esposter/shared";
import { existsSync, readFileSync } from "node:fs";

// The machine's profile, or undefined when it has none yet or the file is not a profile
export const readMachineProfile = (): MachineProfile | undefined =>
  existsSync(MACHINE_PROFILE_PATH)
    ? getResult(() => readFileSync(MACHINE_PROFILE_PATH, "utf8")).match(parseMachineProfile, () => undefined)
    : undefined;
