import type { WholeScreenImage } from "#src/models/genshinParity/WholeScreenImage";
import type { WikiImagesResponse } from "#src/models/genshinParity/WikiImagesResponse";

import { getWholeScreenImages } from "#src/services/genshinParity/shared/getWholeScreenImages";
import { WIKI_ORIGIN } from "genshin-persona/src/services/constants.ts";
import { readWikiJson } from "genshin-persona/src/services/readWikiJson.ts";

type WikiImagePageMap = NonNullable<NonNullable<WikiImagesResponse["query"]>["pages"]>;

// The whole-screen screenshots of one wiki article, read through the same wiki client `fetch` reads its references by.
// An article holding more images than one response answers is read batch after batch by the continuation each gives,
// A page answered in two batches merged into one
export const readWholeScreenImages = async (articleTitle: string): Promise<WholeScreenImage[]> => {
  const url = `${WIKI_ORIGIN}/api.php?action=query&generator=images&gimlimit=max&titles=${encodeURIComponent(articleTitle)}&prop=imageinfo&iiprop=size|url&format=json`;
  const pageMap: WikiImagePageMap = {};
  let continueParameters: Record<string, string> | undefined = {};
  while (continueParameters) {
    const query: string = new URLSearchParams(continueParameters).toString();
    // oxlint-disable-next-line no-await-in-loop -- each batch is asked for by the continuation the one before it gave
    const response: WikiImagesResponse = await readWikiJson<WikiImagesResponse>(query ? `${url}&${query}` : url);
    for (const [id, page] of Object.entries(response.query?.pages ?? {})) pageMap[id] = { ...pageMap[id], ...page };
    continueParameters = response.continue;
  }
  return getWholeScreenImages({ query: { pages: pageMap } });
};
