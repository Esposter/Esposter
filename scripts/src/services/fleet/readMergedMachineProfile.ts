import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { mergeMachineProfile } from "#src/services/fleet/mergeMachineProfile";
import { readDetectedCapabilities } from "#src/services/fleet/readDetectedCapabilities";
import { readMachineProfile } from "#src/services/fleet/readMachineProfile";
import { hostname } from "node:os";

// The profile this machine holds now: the saved one merged with what the machine detects and its hostname. It reads the
// Profile and writes nothing, so `ai:fleet:profile` writes what it returns and a report reads the same capabilities
export const readMergedMachineProfile = async (): Promise<MachineProfile> =>
  mergeMachineProfile(readMachineProfile(), await readDetectedCapabilities(), hostname());
