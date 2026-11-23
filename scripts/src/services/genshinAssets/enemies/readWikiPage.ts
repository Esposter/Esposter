import { wikiPageResponseSchema } from "#src/models/genshinAssets/enemies/WikiPageResponse";
import { toWikiPageCachePath } from "#src/services/genshinAssets/enemies/toWikiPageCachePath";
import { WIKI_API_URL } from "#src/services/genshinAssets/shared/constants";
import { readWikiApi } from "#src/services/shared/readWikiApi";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { WIKI_API_MAX_BYTES } from "genshin-persona/src/services/constants.ts";
import { writeFileSync } from "node:fs";

// Fetches one wiki page through the wiki's API into its cache file, checking that the answer is a page before it is
// Kept: A cached refusal or missing page would never be fetched again
export const readWikiPage = async (cacheDirectory: string, title: string): Promise<void> => {
  const searchParams = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "revisions",
    redirects: "1",
    rvprop: "content",
    rvslots: "main",
    titles: title,
  });
  const response = await readWikiApi(`${WIKI_API_URL}?${searchParams}`, wikiPageResponseSchema, WIKI_API_MAX_BYTES);
  const [page] = response.query.pages;
  if (page?.missing || !page?.revisions?.length)
    throw new InvalidOperationError(Operation.Read, title, "is not a page on the wiki");
  writeFileSync(toWikiPageCachePath(cacheDirectory, title), JSON.stringify(response));
};
