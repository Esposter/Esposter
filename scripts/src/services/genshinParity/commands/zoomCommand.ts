import type { SubCommandsDef } from "citty";

import { regionArgs } from "#src/services/genshinParity/commands/regionArgs";
import { zoomImage } from "#src/services/genshinParity/zoomImage";
import { defineCommand } from "citty";

export const zoomCommand: SubCommandsDef[string] = defineCommand({
  args: {
    image: { description: "The image to read", required: true, type: "positional" },
    ...regionArgs,
    scale: { default: "8", description: "How many times to enlarge it", required: false, type: "positional" },
    grid: { default: "0", description: "Lines every so many of the image's pixels, labelled", type: "string" },
    with: { description: "Other images whose same region is stacked under it, comma-separated", type: "string" },
  },
  meta: {
    description: "A region enlarged with hard edges, and the same region of other images under it",
    name: "zoom",
  },
  run: ({ args }) =>
    zoomImage(
      [args.image, ...(args.with?.split(",") ?? [])],
      Number(args.x),
      Number(args.y),
      Number(args.width),
      Number(args.height),
      Number(args.scale),
      Number(args.grid),
    ),
});
