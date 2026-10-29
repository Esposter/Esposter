import type { SubCommandsDef } from "citty";

import { readBodyHumanScale } from "#src/services/genshinAssets/locomotion/readBodyHumanScale";
import { readLocomotionClips } from "#src/services/genshinAssets/locomotion/readLocomotionClips";
import { formatRoundedValue } from "#src/services/genshinAssets/shared/formatRoundedValue";
import { defineCommand } from "citty";

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
      "Export a body type's locomotion clips and read each one's root motion in metres at the body's human scale: its seconds, the ground it covers and its speed, its rise, and the average speed it records",
    name: "locomotion",
  },
  run: async ({ args }) => {
    const humanScale = await readBodyHumanScale(args.body);
    console.log(`Human scale: ${formatRoundedValue(humanScale)} m`);
    for (const { averageGroundSpeed, duration, groundDistance, groundSpeed, name, rise } of await readLocomotionClips(
      args.body,
      humanScale,
    ))
      console.log(
        `${name}: ${formatRoundedValue(duration)} s, ${formatRoundedValue(groundDistance)} m across at ${formatRoundedValue(groundSpeed)} m/s (recorded ${formatRoundedValue(averageGroundSpeed)}), rising ${formatRoundedValue(rise)} m`,
      );
  },
});
