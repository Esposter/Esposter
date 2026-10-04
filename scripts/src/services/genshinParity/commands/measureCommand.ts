import type { SubCommandsDef } from "citty";

import { measureImage } from "#src/services/genshinParity/image/measureImage";
import { defineCommand } from "citty";

export const measureCommand: SubCommandsDef[string] = defineCommand({
  args: { image: { description: "The image to read", required: true, type: "positional" } },
  meta: { description: "The image's size and the colour under each x,y given after it", name: "measure" },
  run: ({ args }) => measureImage(args.image, args._.slice(1)),
});
