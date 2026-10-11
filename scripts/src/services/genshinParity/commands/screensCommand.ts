import type { SubCommandsDef } from "citty";

import { formatWholeScreenLines } from "#src/services/genshinParity/shared/formatWholeScreenLines";
import { readWholeScreenImages } from "#src/services/genshinParity/shared/readWholeScreenImages";
import { defineCommand } from "citty";

export const screensCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "The whole-screen screenshots of wiki articles, widest first, the stills a screen is measured from",
    name: "screens",
  },
  run: async ({ args }) => {
    const articleLines = await Promise.all(
      args._.map(async (articleTitle) =>
        formatWholeScreenLines(articleTitle, await readWholeScreenImages(articleTitle)),
      ),
    );
    for (const line of articleLines.flat()) console.log(line);
  },
});
