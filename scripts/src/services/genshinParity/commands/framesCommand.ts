import type { SubCommandsDef } from "citty";

import { sampleFrames } from "#src/services/genshinParity/image/sampleFrames";
import { defineCommand } from "citty";

export const framesCommand: SubCommandsDef[string] = defineCommand({
  args: {
    source: { description: "A video or animated image, or a wiki File: title", required: true, type: "positional" },
    fps: { default: "10", description: "Frames a second", required: false, type: "positional" },
    start: { default: "0", description: "The second the window starts at", required: false, type: "positional" },
    seconds: {
      default: "",
      description: "Seconds the window lasts, to the end when not given",
      required: false,
      type: "positional",
    },
  },
  meta: { description: "A video or animated image as stills and a contact sheet, over a window", name: "frames" },
  run: ({ args }) =>
    sampleFrames(args.source, Number(args.fps), Number(args.start), args.seconds ? Number(args.seconds) : undefined),
});
