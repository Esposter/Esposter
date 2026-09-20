import type { WikiParseResponse } from "#src/models/WikiParseResponse";

import { WIKI_FETCH_TIMEOUT_MS, WIKI_USER_AGENT, WIKI_VOICE_OVERS_URL } from "#src/services/constants";

// One page of the community wiki as its author wrote it, through the parse API; "" for a page it does not hold
export const readWikiPageText = async (page: string): Promise<string> => {
  const response = await fetch(`${WIKI_VOICE_OVERS_URL}${encodeURIComponent(page)}`, {
    headers: { "user-agent": WIKI_USER_AGENT },
    signal: AbortSignal.timeout(WIKI_FETCH_TIMEOUT_MS),
  });
  const { parse } = (await response.json()) as WikiParseResponse;
  return parse?.wikitext?.["*"] ?? "";
};
