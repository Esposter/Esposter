import type { VoiceLine } from "#src/models/VoiceLine";

import { DEFAULT_LANGUAGE, WikiVoiceOversPageMap } from "#src/services/constants";
import { getCanonicalLanguage } from "#src/services/getCanonicalLanguage";
import { getPlainLineText } from "#src/services/getPlainLineText";
import { readGenshinDb } from "#src/services/readGenshinDb";
import { readLanguageNames } from "#src/services/readLanguageNames";
import { readWikiStoryLines } from "#src/services/readWikiStoryLines";

// Every line the character speaks in the interface language, as a person reads it; `checkIsOwnVoiceLine` is the
// Authoring command's cut. A character the data package has no lines for yet is read off the wiki's page for that
// Language, which `WikiVoiceOversPageMap` says exists for the four dubs alone — so under any other language that
// Character has none here and the spinner shows their description instead, one script in the spinner rather than
// Two. A language the package does not name answers in English throughout
export const readVoiceLines = (name: string, language: string): Promise<VoiceLine[]> => {
  const genshindb = readGenshinDb();
  const resultLanguage = getCanonicalLanguage(readLanguageNames(), language);
  const voiceovers = resultLanguage
    ? genshindb.voiceovers(name, { queryLanguages: [genshindb.Language.English], resultLanguage })
    : genshindb.voiceovers(name);
  const friendLines = voiceovers?.friendLines ?? [];
  if (friendLines.length > 0)
    return Promise.resolve(
      friendLines.map(({ description, title }) => ({
        text: getPlainLineText(description),
        title: title.trim(),
      })),
    );

  const wikiPage = WikiVoiceOversPageMap[resultLanguage ?? DEFAULT_LANGUAGE];
  return wikiPage ? readWikiStoryLines(name, wikiPage) : Promise.resolve([]);
};
