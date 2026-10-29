import type { SubCommandsDef } from "citty";

import { formatRoundedValue } from "#src/services/genshinAssets/shared/formatRoundedValue";
import { readClipTimings } from "#src/services/genshinAssets/timings/readClipTimings";
import { defineCommand } from "citty";

export const timingsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    pattern: {
      description:
        "The clips to read, by the name pattern their names match, such as ^Ani_Monster_Hili_Club_NormalAtk$",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Export the animation clips a name pattern matches as JSON, then print each one's seconds from its start to its stop and the second each event it fires fires at, with the function it calls",
    name: "timings",
  },
  run: async ({ args }) => {
    for (const { duration, events, name } of await readClipTimings(args.pattern)) {
      console.log(`${name}: ${formatRoundedValue(duration)} s`);
      for (const { functionName, time } of events) console.log(`  ${formatRoundedValue(time)} s ${functionName}`);
    }
  },
});
