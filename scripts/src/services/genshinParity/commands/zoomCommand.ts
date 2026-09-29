import type { SubCommandsDef } from "citty";

import { regionArgs } from "#src/services/genshinParity/commands/regionArgs";
import { zoomImage } from "#src/services/genshinParity/zoomImage";
import { defineCommand } from "citty";

export const zoomCommand: SubCommandsDef[string] = defineCommand({
  args: {
    image: { description: "The image to read", required: true, type: "positional" },
    ...regionArgs,
    scale: { default: "8", description: "How many times to enlarge it", required: false, type: "positional" },
  },
  meta: { description: "A region enlarged with hard edges", name: "zoom" },
  run: ({ args }) =>
    zoomImage(args.image, Number(args.x), Number(args.y), Number(args.width), Number(args.height), Number(args.scale)),
});
