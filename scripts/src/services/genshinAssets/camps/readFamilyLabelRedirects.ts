import {
  FAMILY_LABEL_REDIRECT_BATCH_SIZE,
  FAMILY_LABEL_REDIRECTS_PATH,
} from "#src/services/genshinAssets/camps/constants";
import { fetchRedirectBatch } from "#src/services/genshinAssets/camps/fetchRedirectBatch";
import { WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The title each family label redirects to on the wiki, read from the cache file, which records every label asked about
// So that a label added to the map later is fetched once. Labels the cache lacks are fetched in batches unless a dry
// Run, Which fetches nothing and so maps only the labels already cached
export const readFamilyLabelRedirects = async (
  labels: readonly string[],
  isDryRun: boolean,
): Promise<ReadonlyMap<string, string>> => {
  const cached = existsSync(FAMILY_LABEL_REDIRECTS_PATH)
    ? parseMachineJson<Record<string, null | string>>(readFileSync(FAMILY_LABEL_REDIRECTS_PATH, "utf8"))
    : {};
  const uncached = labels.filter((label) => !Object.hasOwn(cached, label));
  if (uncached.length > 0 && !isDryRun) {
    for (let start = 0; start < uncached.length; start += FAMILY_LABEL_REDIRECT_BATCH_SIZE) {
      const batch = uncached.slice(start, start + FAMILY_LABEL_REDIRECT_BATCH_SIZE);
      // Enemy pages are
      // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one batch is asked for at a time, as the
      Object.assign(cached, await fetchRedirectBatch(batch));
    }
    mkdirSync(WIKI_CACHE_DIRECTORY, { recursive: true });
    writeFileSync(FAMILY_LABEL_REDIRECTS_PATH, JSON.stringify(cached));
  }
  return new Map(Object.entries(cached).filter((entry): entry is [string, string] => entry[1] !== null));
};
