import type { SubCommandsDef } from "citty";

import { readClipTimings } from "#src/services/genshinAssets/timings/readClipTimings";
import { defineCommand } from "citty";

const format = (value: number): string => String(Math.round(value * 1000) / 1000);

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
      console.log(`${name}: ${format(duration)} s`);
      for (const { functionName, time } of events) console.log(`  ${format(time)} s ${functionName}`);
    }
  },
});
