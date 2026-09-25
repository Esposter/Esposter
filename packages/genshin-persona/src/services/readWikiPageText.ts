import type { WikiParseResponse } from "#src/models/WikiParseResponse";

import { WIKI_VOICE_OVERS_URL } from "#src/services/constants";
import { readWikiJson } from "#src/services/readWikiJson";

// One page of the community wiki as its author wrote it, through the parse API; "" for a page it does not hold
export const readWikiPageText = async (page: string): Promise<string> => {
  const { parse } = await readWikiJson<WikiParseResponse>(`${WIKI_VOICE_OVERS_URL}${encodeURIComponent(page)}`);
  return parse?.wikitext?.["*"] ?? "";
};
