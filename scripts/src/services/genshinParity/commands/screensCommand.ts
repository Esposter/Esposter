import type { SubCommandsDef } from "citty";

import { formatWholeScreenLines } from "#src/services/genshinParity/shared/formatWholeScreenLines";
import { readWholeScreenImages } from "#src/services/genshinParity/shared/readWholeScreenImages";
import { saveWholeScreenImages } from "#src/services/genshinParity/shared/saveWholeScreenImages";
import { defineCommand } from "citty";

export const screensCommand: SubCommandsDef[string] = defineCommand({
  args: {
    save: {
      default: "",
      description: "The directory the listed images are downloaded into, each under its file title",
      required: false,
      type: "string",
    },
  },
  meta: {
    description: "The whole-screen screenshots of wiki articles, widest first, the stills a screen is measured from",
    name: "screens",
  },
  run: async ({ args }) => {
    const articles = await Promise.all(
      args._.map(async (articleTitle) => ({ articleTitle, images: await readWholeScreenImages(articleTitle) })),
    );
    for (const line of articles.flatMap(({ articleTitle, images }) => formatWholeScreenLines(articleTitle, images)))
      console.log(line);
    if (!args.save) return;
    const savedLines = await Promise.all(articles.map(({ images }) => saveWholeScreenImages(args.save, images)));
    for (const line of savedLines.flat()) console.log(line);
  },
});
