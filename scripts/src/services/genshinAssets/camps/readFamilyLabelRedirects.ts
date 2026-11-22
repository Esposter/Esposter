import { wikiRedirectResponseSchema } from "#src/models/genshinAssets/enemies/WikiRedirectResponse";
import {
  FAMILY_LABEL_REDIRECT_BATCH_SIZE,
  FAMILY_LABEL_REDIRECTS_PATH,
} from "#src/services/genshinAssets/camps/constants";
import { WIKI_API_URL, WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readWikiApi } from "#src/services/shared/readWikiApi";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The title each label was asked about redirects to, or null when the wiki has no redirect from it
type FamilyLabelRedirects = Record<string, null | string>;

// The redirect target of each label in one batch, read from the wiki's answer for the batch
const fetchRedirectBatch = async (labels: readonly string[]): Promise<FamilyLabelRedirects> => {
  const searchParams = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    redirects: "1",
    titles: labels.join("|"),
  });
  const { query } = await readWikiApi(`${WIKI_API_URL}?${searchParams}`, wikiRedirectResponseSchema);
  const targets = new Map((query.redirects ?? []).map(({ from, to }) => [from, to]));
  return Object.fromEntries(labels.map((label) => [label, targets.get(label) ?? null]));
};

// The title each family label redirects to on the wiki, read from the cache file, which records every label asked about
// So that a label added to the map later is fetched once. Labels the cache lacks are fetched in batches unless a dry run,
// Which fetches nothing and so maps only the labels already cached
export const readFamilyLabelRedirects = async (
  labels: readonly string[],
  isDryRun: boolean,
): Promise<ReadonlyMap<string, string>> => {
  const cached = existsSync(FAMILY_LABEL_REDIRECTS_PATH)
    ? parseMachineJson<FamilyLabelRedirects>(readFileSync(FAMILY_LABEL_REDIRECTS_PATH, "utf8"))
    : {};
  const uncached = labels.filter((label) => !Object.hasOwn(cached, label));
  if (uncached.length > 0 && !isDryRun) {
    for (let start = 0; start < uncached.length; start += FAMILY_LABEL_REDIRECT_BATCH_SIZE) {
      const batch = uncached.slice(start, start + FAMILY_LABEL_REDIRECT_BATCH_SIZE);
      // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one batch is asked for at a time, as the enemy pages are
      Object.assign(cached, await fetchRedirectBatch(batch));
    }
    mkdirSync(WIKI_CACHE_DIRECTORY, { recursive: true });
    writeFileSync(FAMILY_LABEL_REDIRECTS_PATH, JSON.stringify(cached));
  }
  return new Map(Object.entries(cached).filter((entry): entry is [string, string] => entry[1] !== null));
};
