import type { WikiImageInfoResponse } from "#src/models/WikiImageInfoResponse";

import { WIKI_IMAGE_INFO_URL } from "#src/services/constants";
import { readWikiJson } from "#src/services/readWikiJson";

// Where the wiki serves each file from, by the title asked for; a title it does not hold — a line renamed or
// Removed since the reference selection ran — has no entry, and is reported rather than guessed around. The API
// Answers under normalised titles, spaces for underscores, so the answer is mapped back through its own record
export const readWikiFileUrls = async (titles: string[]): Promise<Map<string, string>> => {
  const { query } = await readWikiJson<WikiImageInfoResponse>(
    `${WIKI_IMAGE_INFO_URL}${encodeURIComponent(titles.join("|"))}`,
  );
  const askedTitles = new Map((query?.normalized ?? []).map(({ from = "", to = "" }) => [to, from]));
  return new Map(
    Object.values(query?.pages ?? {}).flatMap(({ imageinfo, title = "" }) => {
      const url = imageinfo?.[0]?.url;
      return url ? [[askedTitles.get(title) ?? title, url]] : [];
    }),
  );
};
