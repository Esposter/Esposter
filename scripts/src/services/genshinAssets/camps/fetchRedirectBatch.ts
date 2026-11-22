import { wikiRedirectResponseSchema } from "#src/models/genshinAssets/enemies/WikiRedirectResponse";
import { WIKI_API_URL } from "#src/services/genshinAssets/kits/constants";
import { readWikiApi } from "#src/services/shared/readWikiApi";

// The redirect target of each label in one batch, read from the wiki's answer for the batch, or null where the wiki
// Has no redirect from it
export const fetchRedirectBatch = async (labels: readonly string[]): Promise<Record<string, null | string>> => {
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
