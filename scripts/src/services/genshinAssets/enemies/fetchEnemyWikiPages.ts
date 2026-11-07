import { fetchWikiPage } from "#src/services/genshinAssets/enemies/fetchWikiPage";
import { toWikiPageCachePath } from "#src/services/genshinAssets/enemies/toWikiPageCachePath";
import { WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { existsSync, mkdirSync } from "node:fs";

// Fetches each of the given enemy wiki pages the cache lacks, one after another, and leaves a cached page untouched. A dry
// Run fetches nothing and reports which pages a run would fetch. Returns one line a page, for the command to print
export const fetchEnemyWikiPages = async (
  titles: readonly string[],
  isDryRun: boolean,
  cacheDirectory: string = WIKI_CACHE_DIRECTORY,
): Promise<string> => {
  const lines: string[] = [];
  for (const title of titles) {
    const cachePath = toWikiPageCachePath(cacheDirectory, title);
    if (existsSync(cachePath)) {
      lines.push(`${title}: cached`);
    } else if (isDryRun) {
      lines.push(`${title}: not cached`);
    } else {
      mkdirSync(cacheDirectory, { recursive: true });
      // oxlint-disable-next-line no-await-in-loop -- one page at a time, so the wiki is asked for no more than one at once
      await fetchWikiPage(title, cachePath);
      lines.push(`${title}: fetched`);
    }
  }
  return lines.join("\n");
};
