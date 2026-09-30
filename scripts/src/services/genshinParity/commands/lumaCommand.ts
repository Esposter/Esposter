import type { SubCommandsDef } from "citty";

import { regionArgs } from "#src/services/genshinParity/commands/regionArgs";
import { measureLuma } from "#src/services/genshinParity/measureLuma";
import { defineCommand } from "citty";

export const lumaCommand: SubCommandsDef[string] = defineCommand({
  args: { ...regionArgs },
  meta: {
    description: "One region's darkness across the images or frame folders given after it, as a curve",
    name: "luma",
  },
  run: ({ args }) =>
    measureLuma(Number(args.x), Number(args.y), Number(args.width), Number(args.height), args._.slice(4)),
});
