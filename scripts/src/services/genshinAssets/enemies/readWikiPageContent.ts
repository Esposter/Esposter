import { wikiPageResponseSchema } from "#src/models/genshinAssets/enemies/WikiPageResponse";
import { checkWikiPageCached } from "#src/services/genshinAssets/enemies/checkWikiPageCached";
import { toWikiPageCachePath } from "#src/services/genshinAssets/enemies/toWikiPageCachePath";
import { WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFileSync } from "node:fs";

// The main slot's text of a wiki page the cache holds. A page the cache lacks is an error rather than an empty page,
// Since reading an empty page would drop whatever the wiki gives it
export const readWikiPageContent = (title: string, cacheDirectory: string = WIKI_CACHE_DIRECTORY): string => {
  const cachePath = toWikiPageCachePath(cacheDirectory, title);
  if (!checkWikiPageCached(cacheDirectory, title))
    throw new InvalidOperationError(
      Operation.Read,
      title,
      "is in no wiki cache, which `genshin:assets enemy-pages` fills with the drops modules, the drops template and the enemy articles, and `genshin:assets family-labels` with the enemy pages, outside a dry run",
    );
  const [page] = wikiPageResponseSchema.parse(parseMachineJson(readFileSync(cachePath, "utf8"))).query.pages;
  const content = page?.revisions?.[0]?.slots.main.content;
  if (content === undefined) throw new InvalidOperationError(Operation.Read, title, "is not a page in the wiki cache");
  return content;
};
