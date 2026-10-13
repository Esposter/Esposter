import { mergeMachineProfile } from "#src/services/fleet/mergeMachineProfile";
import { readDetectedCapabilities } from "#src/services/fleet/readDetectedCapabilities";
import { readMachineProfile } from "#src/services/fleet/readMachineProfile";
import { writeMachineProfile } from "#src/services/fleet/writeMachineProfile";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";
import { hostname } from "node:os";

// `pnpm ai:fleet:profile` writes what this machine detects into its profile, keeping the id and areas the user set, and
// Prints the profile (the throughput skill, `references/fleet.md`)
await runCommand(
  defineCommand({
    meta: {
      description: "Write this machine's profile: its id, the areas it is lent and the capabilities it holds",
      name: "profile",
    },
    run: async () => {
      const profile = mergeMachineProfile(readMachineProfile(), await readDetectedCapabilities(), hostname());
      writeMachineProfile(profile);
      console.info(JSON.stringify(profile, null, 2));
    },
  }),
);
