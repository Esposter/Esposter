import { mergeMachineProfile } from "#src/services/fleet/mergeMachineProfile";
import { parseFillKinds } from "#src/services/fleet/parseFillKinds";
import { parseFillTarget } from "#src/services/fleet/parseFillTarget";
import { readDetectedCapabilities } from "#src/services/fleet/readDetectedCapabilities";
import { readMachineProfile } from "#src/services/fleet/readMachineProfile";
import { writeMachineProfile } from "#src/services/fleet/writeMachineProfile";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";
import { hostname } from "node:os";

// `pnpm ai:fleet:profile [--fill-target <n>] [--fill-kinds unit,cpu,page]` — writes what this machine detects into its
// Profile, keeping the id, areas and fill settings the user set, and prints the profile (the throughput skill,
// `references/fleet.md`). A fill setting given replaces the saved one
await runCommand(
  defineCommand({
    args: {
      "fill-kinds": {
        default: "",
        description: "The kinds this machine fills, comma separated: unit, cpu or page; the saved kinds when empty",
        type: "string",
      },
      "fill-target": {
        default: "",
        description: "The live claims this machine keeps; the saved target when empty",
        type: "string",
      },
    },
    meta: {
      description:
        "Write this machine's profile: its id, the areas it is lent, the capabilities it holds and its fill share",
      name: "profile",
    },
    run: async ({ args }) => {
      const profile = mergeMachineProfile(readMachineProfile(), await readDetectedCapabilities(), hostname(), {
        fillKinds: args["fill-kinds"] === "" ? undefined : parseFillKinds(args["fill-kinds"]),
        fillTarget: args["fill-target"] === "" ? undefined : parseFillTarget(args["fill-target"]),
      });
      writeMachineProfile(profile);
      console.info(JSON.stringify(profile, null, 2));
    },
  }),
);
