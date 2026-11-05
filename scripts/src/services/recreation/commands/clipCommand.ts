import type { SubCommandsDef } from "citty";

import { clipSectionArgs } from "#src/services/recreation/commands/clipSectionArgs";
import { downloadClipSection } from "#src/services/recreation/video/downloadClipSection";
import { defineCommand } from "citty";

export const clipCommand: SubCommandsDef[string] = defineCommand({
  args: {
    ...clipSectionArgs,
    directory: { default: ".", description: "The directory the clip is written into", required: false, type: "string" },
  },
  meta: {
    description: "A section of a public video at the best MP4 up to 1080 high, into a directory; prints its path",
    name: "clip",
  },
  run: async ({ args }) => {
    console.log(await downloadClipSection(args, args.directory));
  },
});
