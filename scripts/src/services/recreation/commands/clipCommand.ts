import type { SubCommandsDef } from "citty";

import { downloadClip } from "#src/services/recreation/video/downloadClip";
import { defineCommand } from "citty";

export const clipCommand: SubCommandsDef[string] = defineCommand({
  args: {
    url: { description: "The public video's URL", required: true, type: "positional" },
    directory: { default: ".", description: "The directory the clip is written into", required: false, type: "string" },
    from: { description: "The second the section starts at", required: true, type: "string" },
    name: {
      default: "",
      description: "The clip's name in its file name, from-to when not given",
      required: false,
      type: "string",
    },
    to: { description: "The second the section ends at", required: true, type: "string" },
  },
  meta: {
    description: "A section of a public video at the best MP4 up to 1080 high, into a directory; prints its path",
    name: "clip",
  },
  run: async ({ args }) => {
    // A clip name holds no period, so a fractional second is written with an underscore
    const name = args.name || `${args.from}-${args.to}`.replaceAll(".", "_");
    console.log(await downloadClip(args.url, Number(args.from), Number(args.to), name, args.directory));
  },
});
