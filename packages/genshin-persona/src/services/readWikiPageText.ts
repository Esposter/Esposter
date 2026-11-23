import { checkIsWikiParseResponse } from "#src/services/checkIsWikiParseResponse";
import { WIKI_API_MAX_BYTES, WIKI_VOICE_OVERS_URL } from "#src/services/constants";
import { readWikiJson } from "#src/services/readWikiJson";

// One page of the community wiki as its author wrote it, through the parse API; "" for a page it does not hold
export const readWikiPageText = async (page: string): Promise<string> => {
  const response = await readWikiJson(
    `${WIKI_VOICE_OVERS_URL}${encodeURIComponent(page)}`,
    checkIsWikiParseResponse,
    WIKI_API_MAX_BYTES,
  );
  return response?.parse?.wikitext?.["*"] ?? "";
};
