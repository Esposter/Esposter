import type { WholeScreenImage } from "#src/models/genshinParity/WholeScreenImage";

import { getWholeScreenSavePath } from "#src/services/genshinParity/shared/getWholeScreenSavePath";
import { writeWikiFiles } from "#src/services/genshinParity/shared/writeWikiFiles";
import { mkdir } from "node:fs/promises";

// Every image saved into a directory through the wiki client, which names the wiki as the file host's referrer; an
// Image already there is kept as it is, and one the wiki does not serve is reported as not saved
export const saveWholeScreenImages = async (directory: string, images: WholeScreenImage[]): Promise<string[]> => {
  await mkdir(directory, { recursive: true });
  const files = images.map(({ title, url }) => ({ path: getWholeScreenSavePath(directory, title), title, url }));
  const held = await writeWikiFiles(files);
  return files.map(({ path, title }, index) => (held[index] ? path : `not saved: ${title}`));
};
