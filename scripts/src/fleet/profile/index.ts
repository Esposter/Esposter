import { readMergedMachineProfile } from "#src/services/fleet/readMergedMachineProfile";
import { writeMachineProfile } from "#src/services/fleet/writeMachineProfile";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:fleet:profile` writes what this machine detects into its profile, keeping the id and areas the user set, and
// Prints the profile (the throughput skill, `references/fleet.md`)
await runCommand(
  defineCommand({
    meta: {
      description: "Write this machine's profile: its id, the areas it is lent and the capabilities it holds",
      name: "profile",
    },
    run: async () => {
      const profile = await readMergedMachineProfile();
      writeMachineProfile(profile);
      console.info(JSON.stringify(profile, null, 2));
    },
  }),
);
