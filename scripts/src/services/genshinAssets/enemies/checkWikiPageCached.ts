import { toWikiPageCachePath } from "#src/services/genshinAssets/enemies/toWikiPageCachePath";
import { existsSync } from "node:fs";

// Whether the wiki cache holds a page's response, the one check every reader and fetch of a cached page asks
export const checkWikiPageCached = (cacheDirectory: string, title: string): boolean =>
  existsSync(toWikiPageCachePath(cacheDirectory, title));
