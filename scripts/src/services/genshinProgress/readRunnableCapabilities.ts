import { mergeMachineProfile } from "#src/services/fleet/mergeMachineProfile";
import { readDetectedCapabilities } from "#src/services/fleet/readDetectedCapabilities";
import { readMachineProfile } from "#src/services/fleet/readMachineProfile";
import { hostname } from "node:os";

// The capabilities this machine meets, as `ai:fleet:profile` would write them: the detected ones and the ones the user
// Set. It reads the profile and writes nothing, and a machine with no profile yet meets only what it detects
export const readRunnableCapabilities = async (): Promise<string[]> =>
  mergeMachineProfile(readMachineProfile(), await readDetectedCapabilities(), hostname()).capabilities;
