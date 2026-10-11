import type { WholeScreenImage } from "#src/models/genshinParity/WholeScreenImage";

import { getWholeScreenSavePath } from "#src/services/genshinParity/shared/getWholeScreenSavePath";
import { readWikiFile } from "genshin-persona/src/services/readWikiFile.ts";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";

// Every image saved into a directory through the wiki client, which names the wiki as the file host's referrer; an
// Image already there is kept as it is, and one the wiki does not serve is reported as not saved
export const saveWholeScreenImages = async (directory: string, images: WholeScreenImage[]): Promise<string[]> => {
  await mkdir(directory, { recursive: true });
  return Promise.all(
    images.map(async ({ title, url }) => {
      const path = getWholeScreenSavePath(directory, title);
      if (existsSync(path)) return path;
      const file = await readWikiFile(url);
      if (file === undefined) return `not saved: ${title}`;
      await writeFile(path, file);
      return path;
    }),
  );
};
