import { wikiPageResponseSchema } from "#src/models/genshinAssets/enemies/WikiPageResponse";
import { WIKI_API_URL } from "#src/services/genshinAssets/kits/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { writeFileSync } from "node:fs";

// Fetches one wiki page through the wiki's API into its cache file, checking that the answer is a page before it is kept:
// A cached refusal or missing page would never be fetched again
export const fetchWikiPage = async (title: string, cachePath: string): Promise<void> => {
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
  const text = await (await fetchOk(`${WIKI_API_URL}?${searchParams}`)).text();
  const [page] = wikiPageResponseSchema.parse(parseMachineJson(text)).query.pages;
  if (page?.missing || !page?.revisions?.length)
    throw new InvalidOperationError(Operation.Read, title, "is not a page on the wiki");
  writeFileSync(cachePath, text);
};
