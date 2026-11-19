import type { SubCommandsDef } from "citty";

import { readRegionArgs } from "#src/services/genshinParity/commands/readRegionArgs";
import { regionArgs } from "#src/services/genshinParity/commands/regionArgs";
import { measureClipTrail } from "#src/services/genshinParity/trail/measureClipTrail";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";

export const trailCommand: SubCommandsDef[string] = defineCommand({
  args: {
    clip: { description: "The capture's path, a video FFmpeg reads", required: true, type: "positional" },
    ...regionArgs,
  },
  meta: {
    description:
      "The trail a claymore strike draws in a region of a capture: its width, colour and fade, and the frames it spans, written as JSON beside the capture",
    name: "trail",
  },
  run: async ({ args }) => {
    const rect = readRegionArgs(args);
    const measure = await measureClipTrail(args.clip, rect);
    if (!measure) throw new InvalidOperationError(Operation.Read, args.clip, "draws no trail in its region");
    const measurementPath = join(dirname(args.clip), `${basename(args.clip, extname(args.clip))}.trail.json`);
    writeFileSync(
      measurementPath,
      `${JSON.stringify({ clip: basename(args.clip), region: rect, ...measure }, null, 2)}\n`,
    );
    console.log(
      `width ${measure.width} px, colour ${measure.colour.join(", ")}, frames ${measure.frames.join("-")}, fade ${measure.fadeSeconds ?? "none"} s, written to ${measurementPath}`,
    );
  },
});
