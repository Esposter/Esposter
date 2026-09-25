import type { VoiceLine } from "#src/models/VoiceLine";

import { TravelerGender } from "#src/models/TravelerGender";
import { DEFAULT_LANGUAGE, TravelerTwinMap, WikiVoiceOversPageMap } from "#src/services/constants";
import { fillLinePlaceholders } from "#src/services/fillLinePlaceholders";
import { getCanonicalLanguage } from "#src/services/getCanonicalLanguage";
import { getPlainLineText } from "#src/services/getPlainLineText";
import { readGenshinDb } from "#src/services/readGenshinDb";
import { readLanguageNames } from "#src/services/readLanguageNames";
import { readWikiStoryLines } from "#src/services/readWikiStoryLines";

// The player a line is shown to when the character is not a twin: the first twin, as the wiki's word choices show
// The first form until told otherwise
const DEFAULT_TRAVELER_NAME = "Aether";
// Every line the character speaks in the interface language, as a person reads it; `checkIsOwnVoiceLine` is the
// Authoring command's cut. The game data's lines are filled in for a player: the twin themselves in a twin's own
// Lines, else the first twin, named as the interface language spells them. A character the data package has no
// Lines for yet is read off the wiki's page for that language, which `WikiVoiceOversPageMap` says exists for the
// Four dubs alone — so under any other language that character has none here and the spinner shows their
// Description instead, one script in the spinner rather than two. A language the package does not name answers in
// English throughout
export const readVoiceLines = (name: string, language: string): Promise<VoiceLine[]> => {
  const genshindb = readGenshinDb();
  const resultLanguage = getCanonicalLanguage(readLanguageNames(), language);
  const queryOptions = resultLanguage ? { queryLanguages: [genshindb.Language.English], resultLanguage } : {};
  const friendLines = genshindb.voiceovers(name, queryOptions)?.friendLines ?? [];
  if (friendLines.length > 0) {
    const twin = TravelerTwinMap[name];
    const travelerName = twin ? name : DEFAULT_TRAVELER_NAME;
    const nickname = genshindb.characters(travelerName, queryOptions)?.name ?? travelerName;
    const gender = twin?.gender ?? TravelerGender.Male;
    return Promise.resolve(
      friendLines.map(({ description, title }) => ({
        text: getPlainLineText(fillLinePlaceholders(description, nickname, gender)),
        title: title.trim(),
      })),
    );
  }

  const wikiPage = WikiVoiceOversPageMap[resultLanguage ?? DEFAULT_LANGUAGE];
  return wikiPage ? readWikiStoryLines(name, wikiPage) : Promise.resolve([]);
};
