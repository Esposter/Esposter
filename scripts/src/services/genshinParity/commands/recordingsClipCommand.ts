import type { SubCommandsDef } from "citty";

import { CAPTURES_DIRECTORY } from "#src/services/genshinParity/game/constants";
import { recordClip } from "#src/services/genshinParity/reference/recordClip";
import { clipSectionArgs } from "#src/services/recreation/commands/clipSectionArgs";
import { downloadClipSection } from "#src/services/recreation/video/downloadClipSection";
import { defineCommand } from "citty";

export const recordingsClipCommand: SubCommandsDef[string] = defineCommand({
  args: { ...clipSectionArgs },
  meta: {
    description:
      "A section of a public video at the best MP4 up to 1080 high into the captures folder, its manifest row written beside it; prints its path",
    name: "clip",
  },
  run: async ({ args }) => {
    const path = await downloadClipSection(args, CAPTURES_DIRECTORY);
    await recordClip(path, args.url, { end: Number(args.to), start: Number(args.from) });
    console.log(path);
  },
});
