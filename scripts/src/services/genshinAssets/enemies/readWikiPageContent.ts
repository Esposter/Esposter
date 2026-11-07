import { wikiPageResponseSchema } from "#src/models/genshinAssets/enemies/WikiPageResponse";
import { toWikiPageCachePath } from "#src/services/genshinAssets/enemies/toWikiPageCachePath";
import { WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, readFileSync } from "node:fs";

// The main slot's text of a wiki page the cache holds. A page the cache lacks is an error rather than an empty page, since
// Reading an empty page would drop whatever the wiki gives it
export const readWikiPageContent = (title: string, cacheDirectory: string = WIKI_CACHE_DIRECTORY): string => {
  const cachePath = toWikiPageCachePath(cacheDirectory, title);
  if (!existsSync(cachePath))
    throw new InvalidOperationError(
      Operation.Read,
      title,
      "is in no wiki cache, so `genshin:assets enemy-pages` fetches it first",
    );
  const [page] = wikiPageResponseSchema.parse(parseMachineJson(readFileSync(cachePath, "utf8"))).query.pages;
  const content = page?.revisions?.[0]?.slots.main.content;
  if (content === undefined) throw new InvalidOperationError(Operation.Read, title, "is not a page in the wiki cache");
  return content;
};
