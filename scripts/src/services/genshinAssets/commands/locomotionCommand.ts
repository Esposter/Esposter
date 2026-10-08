import type { SubCommandsDef } from "citty";

import { readLocomotionClips } from "#src/services/genshinAssets/locomotion/readLocomotionClips";
import { defineCommand } from "citty";

const format = (value: number): string => String(Math.round(value * 1000) / 1000);

export const locomotionCommand: SubCommandsDef[string] = defineCommand({
  args: {
    body: {
      description: "The body type as the game's clip names spell it: Boy, Girl, Lady, Male or Loli",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Export a body type's locomotion clips and read each one's root motion: its seconds, the ground it covers and its speed, its rise, and the average speed it records",
    name: "locomotion",
  },
  run: async ({ args }) => {
    for (const { averageGroundSpeed, duration, groundDistance, groundSpeed, name, rise } of await readLocomotionClips(
      args.body,
    ))
      console.log(
        `${name}: ${format(duration)} s, ${format(groundDistance)} m across at ${format(groundSpeed)} m/s (recorded ${format(averageGroundSpeed)}), rising ${format(rise)} m`,
      );
  },
});
