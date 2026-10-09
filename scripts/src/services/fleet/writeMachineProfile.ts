import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { MACHINE_PROFILE_PATH } from "#src/services/fleet/constants";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const writeMachineProfile = (profile: MachineProfile): void => {
  mkdirSync(dirname(MACHINE_PROFILE_PATH), { recursive: true });
  writeFileSync(MACHINE_PROFILE_PATH, `${JSON.stringify(profile, null, 2)}\n`);
};
