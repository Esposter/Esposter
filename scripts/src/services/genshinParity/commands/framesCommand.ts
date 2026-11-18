import type { SubCommandsDef } from "citty";

import { readRegionArgs } from "#src/services/genshinParity/commands/readRegionArgs";
import { regionArgs } from "#src/services/genshinParity/commands/regionArgs";
import { measureClipFrames } from "#src/services/genshinParity/frames/measureClipFrames";
import { defineCommand } from "citty";

export const framesCommand: SubCommandsDef[string] = defineCommand({
  args: {
    clip: { description: "The clip's path, a video FFmpeg reads", required: true, type: "positional" },
    ...regionArgs,
  },
  meta: {
    description:
      "A rectangle of a clip read in every frame, one JSON line a frame: its index and second, the rectangle's mean colour, its ink summed over every pixel, and the box its ink fills in the rectangle's own pixels",
    name: "frames",
  },
  run: async ({ args }) => {
    for (const row of await measureClipFrames(args.clip, readRegionArgs(args))) console.log(JSON.stringify(row));
  },
});
