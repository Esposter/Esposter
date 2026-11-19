import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readClipMotions } from "#src/services/genshinAssets/motion/readClipMotions";
import { formatRoundedValue } from "#src/services/genshinAssets/shared/formatRoundedValue";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { defineCommand } from "citty";

export const motionCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose exported clips to read: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
    pattern: {
      description: "The clips to read, by the name pattern their names match, such as ^Ani_Animal_Fox_01_Scared$",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Read the clips a name pattern matches from the JSON `clips` wrote, then print each one's seconds, its root's translation in metres from its start to its stop and its speed in metres a second",
    name: "motion",
  },
  run: async ({ args }) => {
    for (const { duration, name, rootTranslation, speed } of await readClipMotions(
      parseDerivedAssetComponent(args.component),
      args.pattern,
    )) {
      console.log(`${name}: ${formatRoundedValue(duration)} s`);
      if (rootTranslation === undefined) console.log("  no root motion decoded, so no speed");
      else {
        console.log(`  root translation: ${formatRoundedValue(rootTranslation)} m`);
        if (speed !== undefined) console.log(`  speed: ${formatRoundedValue(speed)} m/s`);
      }
    }
  },
});
