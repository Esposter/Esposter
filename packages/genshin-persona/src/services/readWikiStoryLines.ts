import type { WikiStoryLine } from "#src/models/WikiStoryLine";

import { TravelerTwinMap } from "#src/services/constants";
import { parseWikiStoryLines } from "#src/services/parseWikiStoryLines";
import { parseWikiTravelerLines } from "#src/services/parseWikiTravelerLines";
import { readWikiPageText } from "#src/services/readWikiPageText";

const VOICE_OVERS_SUBPAGE = "/Voice-Overs";
// The page the twins share, under the name the wiki gives the pair
const TRAVELER_PAGE = "Traveler";
// The Traveler's index lists its story pages as one relative link per region
const STORY_PAGE_LINK_REGEX = /^\* \[\[\/(?<page>[^\]|]+)/gmu;

// The community wiki's voice-over page for one character, parsed on request. A player twin has no page of their
// Own: their lines are the Traveler's, one story page per region, read as the twin's half of each dialogue
export const readWikiStoryLines = async (name: string): Promise<WikiStoryLine[]> => {
  const twin = TravelerTwinMap[name];
  if (!twin) {
    const wikitext = await readWikiPageText(`${name}${VOICE_OVERS_SUBPAGE}`);
    return parseWikiStoryLines(wikitext);
  }

  const travelerPage = `${TRAVELER_PAGE}${VOICE_OVERS_SUBPAGE}`;
  const index = await readWikiPageText(travelerPage);
  const pages = Array.from(index.matchAll(STORY_PAGE_LINK_REGEX), (match) => match.groups?.page ?? "");
  const lines = await Promise.all(
    pages.map(async (page) => {
      const wikitext = await readWikiPageText(`${travelerPage}/${page}`);
      return parseWikiTravelerLines(wikitext, name, twin);
    }),
  );
  return lines.flat();
};
