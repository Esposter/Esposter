import { wikiRedirectResponseSchema } from "#src/models/genshinAssets/enemies/WikiRedirectResponse";
import {
  FAMILY_LABEL_REDIRECT_BATCH_SIZE,
  FAMILY_LABEL_REDIRECTS_PATH,
} from "#src/services/genshinAssets/camps/constants";
import { WIKI_API_URL, WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The redirects the wiki answers for one batch of titles, each from a title the batch named to the title it sends it to
const fetchRedirectBatch = async (titles: readonly string[]): Promise<{ from: string; to: string }[]> => {
  const searchParams = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    redirects: "1",
    titles: titles.join("|"),
  });
  const text = await (await fetchOk(`${WIKI_API_URL}?${searchParams}`)).text();
  return wikiRedirectResponseSchema.parse(parseMachineJson(text)).query.redirects ?? [];
};

// The title the wiki sends each family label to when the label is a redirect, read from the cache file when it holds them.
// Else they are fetched through the wiki's API in batches and cached, unless a dry run, which fetches nothing and reads
// None. A label the wiki has no page for is not redirected, so it is absent from the map
export const readFamilyLabelRedirects = async (
  labels: readonly string[],
  isDryRun: boolean,
): Promise<ReadonlyMap<string, string>> => {
  if (!existsSync(FAMILY_LABEL_REDIRECTS_PATH)) {
    if (isDryRun) return new Map();
    const redirects: { from: string; to: string }[] = [];
    for (let start = 0; start < labels.length; start += FAMILY_LABEL_REDIRECT_BATCH_SIZE) {
      const batch = labels.slice(start, start + FAMILY_LABEL_REDIRECT_BATCH_SIZE);
      // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one batch is asked for at a time, as the enemy pages are
      redirects.push(...(await fetchRedirectBatch(batch)));
    }
    mkdirSync(WIKI_CACHE_DIRECTORY, { recursive: true });
    writeFileSync(FAMILY_LABEL_REDIRECTS_PATH, JSON.stringify(redirects));
  }
  const redirects = parseMachineJson<{ from: string; to: string }[]>(readFileSync(FAMILY_LABEL_REDIRECTS_PATH, "utf8"));
  return new Map(redirects.map(({ from, to }) => [from, to]));
};
