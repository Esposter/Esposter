import { join } from "node:path";

// A wiki page's cache file, named for its title with each space an underscore and each slash a `%2F`, as the cache's other
// Pages are
export const toWikiPageCachePath = (cacheDirectory: string, title: string): string =>
  join(cacheDirectory, `Page_${title.replaceAll(" ", "_").replaceAll("/", "%2F")}.json`);
