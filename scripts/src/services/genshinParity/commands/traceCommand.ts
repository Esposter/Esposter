import type { SubCommandsDef } from "citty";

import { regionArgs } from "#src/services/genshinParity/commands/regionArgs";
import { traceImage } from "#src/services/genshinParity/shared/traceImage";
import { defineCommand } from "citty";

export const traceCommand: SubCommandsDef[string] = defineCommand({
  args: {
    source: { description: "An image, or a wiki File: title", required: true, type: "positional" },
    ...regionArgs,
    scale: {
      default: "1",
      description: "How many times to enlarge it before tracing, above 1 for a small mark",
      required: false,
      type: "positional",
    },
    inkShare: {
      default: "0.5",
      description:
        "Where the ink split falls between faintest and strongest, lower for a flat logo printed with detail",
      required: false,
      type: "positional",
    },
  },
  meta: {
    description: "A glyph in a region as one SVG path at full resolution, and region | trace to check",
    name: "trace",
  },
  run: ({ args }) =>
    traceImage(
      args.source,
      Number(args.x),
      Number(args.y),
      Number(args.width),
      Number(args.height),
      Number(args.scale),
      Number(args.inkShare),
    ),
});
