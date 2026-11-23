import type { WikiImagePageMap } from "#src/models/genshinParity/shared/WikiImagePageMap";
import type { WholeScreenImage } from "#src/models/genshinParity/WholeScreenImage";
import type { WikiImagesResponse } from "#src/models/genshinParity/WikiImagesResponse";

import { getWholeScreenImages } from "#src/services/genshinParity/shared/getWholeScreenImages";
import { readWikiApi } from "#src/services/shared/readWikiApi";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { WIKI_API_MAX_BYTES, WIKI_ORIGIN } from "genshin-persona/src/services/constants.ts";
import { z } from "zod";

// The answer's shape, checked so a batch the API answers otherwise fails the read rather than reading as empty
const wikiImagesResponseSchema: z.ZodType<WikiImagesResponse> = z.object({
  continue: z.record(z.string(), z.string()).optional(),
  error: z.object({ code: z.string(), info: z.string() }).optional(),
  query: z
    .object({
      pages: z
        .record(
          z.string(),
          z.object({
            imageinfo: z.array(z.object({ height: z.number(), url: z.string(), width: z.number() })).optional(),
            title: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

// The whole-screen screenshots of one wiki article, read through the same wiki client `fetch` reads its references by.
// An article holding more images than one response answers is read batch after batch by the continuation each gives,
// A page answered in two batches merged into one. A batch the API answers with an error fails the read, since the
// Batches before it are not the article's every image
export const readWholeScreenImages = async (articleTitle: string): Promise<WholeScreenImage[]> => {
  const url = `${WIKI_ORIGIN}/api.php?action=query&generator=images&gimlimit=max&titles=${encodeURIComponent(articleTitle)}&prop=imageinfo&iiprop=size|url&format=json`;
  const pageMap: WikiImagePageMap = {};
  let continueParameters: Record<string, string> | undefined = {};
  while (continueParameters) {
    const query: string = new URLSearchParams(continueParameters).toString();
    // Before it gave
    // oxlint-disable-next-line no-await-in-loop -- Pagination: each batch is asked for by the continuation the one
    const response = await readWikiApi(query ? `${url}&${query}` : url, wikiImagesResponseSchema, WIKI_API_MAX_BYTES);
    if (response.error)
      throw new InvalidOperationError(Operation.Read, articleTitle, `${response.error.code}: ${response.error.info}`);
    for (const [id, page] of Object.entries(response.query?.pages ?? {})) pageMap[id] = { ...pageMap[id], ...page };
    continueParameters = response.continue;
  }
  return getWholeScreenImages({ query: { pages: pageMap } });
};
