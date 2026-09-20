import type { WikiImageInfoResponse } from "#src/models/WikiImageInfoResponse";

import { WIKI_IMAGE_INFO_URL, WIKI_USER_AGENT } from "#src/services/constants";

// Where the wiki serves each file from, by the title asked for; a title it does not hold — a line renamed or
// Removed since the reference selection ran — has no entry, and is reported rather than guessed around. The API
// Answers under normalised titles, spaces for underscores, so the answer is mapped back through its own record
export const readWikiFileUrls = async (titles: string[]): Promise<Map<string, string>> => {
  const response = await fetch(`${WIKI_IMAGE_INFO_URL}${encodeURIComponent(titles.join("|"))}`, {
    headers: { "user-agent": WIKI_USER_AGENT },
  });
  const { query } = (await response.json()) as WikiImageInfoResponse;
  const askedTitles = new Map((query?.normalized ?? []).map(({ from = "", to = "" }) => [to, from]));
  return new Map(
    Object.values(query?.pages ?? {}).flatMap(({ imageinfo, title = "" }) => {
      const url = imageinfo?.[0]?.url;
      return url ? [[askedTitles.get(title) ?? title, url]] : [];
    }),
  );
};
