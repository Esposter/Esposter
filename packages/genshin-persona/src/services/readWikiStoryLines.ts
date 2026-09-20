import type { WikiParseResponse } from "#src/models/WikiParseResponse";
import type { WikiStoryLine } from "#src/models/WikiStoryLine";

import { WIKI_USER_AGENT, WIKI_VOICE_OVERS_URL } from "#src/services/constants";
import { parseWikiStoryLines } from "#src/services/parseWikiStoryLines";

// The community wiki's voice-over page for one character, parsed on request
export const readWikiStoryLines = async (name: string): Promise<WikiStoryLine[]> => {
  const response = await fetch(`${WIKI_VOICE_OVERS_URL}${encodeURIComponent(`${name}/Voice-Overs`)}`, {
    headers: { "user-agent": WIKI_USER_AGENT },
  });
  const { parse } = (await response.json()) as WikiParseResponse;
  return parseWikiStoryLines(parse?.wikitext?.["*"] ?? "");
};
