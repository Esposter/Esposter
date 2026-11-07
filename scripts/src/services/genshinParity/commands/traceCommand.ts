import type { SubCommandsDef } from "citty";

import { regionArgs } from "#src/services/genshinParity/commands/regionArgs";
import { traceImage } from "#src/services/genshinParity/shared/traceImage";
import { writeTracedPath } from "#src/services/genshinParity/shared/writeTracedPath";
import { InvalidOperationError, Operation } from "@esposter/shared";
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
    into: {
      description:
        "The keyed map's source file to write the path into, divided by the scale into the reference's pixels",
      required: false,
      type: "string",
    },
    key: {
      description: "The entry's key in that map, as the source writes it, such as InterfaceIcon.Exit; one per layer",
      required: false,
      type: "string",
    },
  },
  meta: {
    description: "A glyph in a region as one SVG path at full resolution, and region | trace to check",
    name: "trace",
  },
  run: async ({ args }) => {
    const { into, key } = args;
    if (into === undefined && key !== undefined)
      throw new InvalidOperationError(
        Operation.Create,
        "--key",
        "needs --into, the map source its entry is written into",
      );
    if (into !== undefined && key === undefined)
      throw new InvalidOperationError(Operation.Create, into, "takes a --key for the entry it writes");
    const scale = Number(args.scale);
    const path = await traceImage(
      args.source,
      Number(args.x),
      Number(args.y),
      Number(args.width),
      Number(args.height),
      scale,
      Number(args.inkShare),
    );
    // The map and its key are both given or neither, checked above
    if (into === undefined || key === undefined) return;
    await writeTracedPath(into, key, path, scale);
    console.log(`${key} written to ${into}`);
  },
});
