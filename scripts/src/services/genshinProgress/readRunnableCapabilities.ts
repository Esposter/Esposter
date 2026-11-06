import { readMergedMachineProfile } from "#src/services/fleet/readMergedMachineProfile";

// The capabilities this machine meets, as `ai:fleet:profile` would write them: the detected ones and the ones the user
// Set. It reads the profile and writes nothing, and a machine with no profile yet meets only what it detects
export const readRunnableCapabilities = async (): Promise<string[]> => (await readMergedMachineProfile()).capabilities;
