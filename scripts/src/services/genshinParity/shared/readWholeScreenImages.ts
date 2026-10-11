import type { WholeScreenImage } from "#src/models/genshinParity/WholeScreenImage";
import type { WikiImagesResponse } from "#src/models/genshinParity/WikiImagesResponse";

import { getWholeScreenImages } from "#src/services/genshinParity/shared/getWholeScreenImages";
import { WIKI_ORIGIN } from "genshin-persona/src/services/constants.ts";
import { readWikiJson } from "genshin-persona/src/services/readWikiJson.ts";

// The whole-screen screenshots of one wiki article, read through the same wiki client `fetch` reads its references by
export const readWholeScreenImages = async (articleTitle: string): Promise<WholeScreenImage[]> => {
  const url = `${WIKI_ORIGIN}/api.php?action=query&generator=images&gimlimit=max&titles=${encodeURIComponent(articleTitle)}&prop=imageinfo&iiprop=size|url&format=json`;
  return getWholeScreenImages(await readWikiJson<WikiImagesResponse>(url));
};
