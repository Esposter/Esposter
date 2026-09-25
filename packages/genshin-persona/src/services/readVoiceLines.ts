import type { VoiceLine } from "#src/models/VoiceLine";

import { TravelerGender } from "#src/models/TravelerGender";
import { DEFAULT_LANGUAGE, TravelerTwinMap, WikiVoiceOversPageMap } from "#src/services/constants";
import { fillLinePlaceholders } from "#src/services/fillLinePlaceholders";
import { getCanonicalLanguage } from "#src/services/getCanonicalLanguage";
import { getPlainLineText } from "#src/services/getPlainLineText";
import { readGenshinDb } from "#src/services/readGenshinDb";
import { readLanguageNames } from "#src/services/readLanguageNames";
import { readWikiStoryLines } from "#src/services/readWikiStoryLines";

// Every line the character speaks in the interface language, as a person reads it; `checkIsOwnVoiceLine` is the
// Authoring command's cut. The game data's lines are filled in with the character's own name as the interface
// Language spells it, the name the tips already run under, and a twin's own gender, else the first form as the
// Wiki's word choices take. A character the data package has no lines for yet is read off the wiki's page for that
// Language, which `WikiVoiceOversPageMap` says exists for the four dubs alone — so under any other language that
// Character has none here and the spinner shows their description instead, one script in the spinner rather than
// Two. A language the package does not name answers in English throughout
export const readVoiceLines = (name: string, language: string): Promise<VoiceLine[]> => {
  const genshindb = readGenshinDb();
  const resultLanguage = getCanonicalLanguage(readLanguageNames(), language);
  const queryOptions = resultLanguage ? { queryLanguages: [genshindb.Language.English], resultLanguage } : {};
  const friendLines = genshindb.voiceovers(name, queryOptions)?.friendLines ?? [];
  if (friendLines.length > 0) {
    const nickname = genshindb.characters(name, queryOptions)?.name ?? name;
    const gender = TravelerTwinMap[name]?.gender ?? TravelerGender.Male;
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
