import type { VoiceLine } from "#src/models/VoiceLine";

import { DEFAULT_LANGUAGE } from "#src/services/constants";
import { getCanonicalLanguage } from "#src/services/getCanonicalLanguage";
import { getPlainLineText } from "#src/services/getPlainLineText";
import { readGenshinDb } from "#src/services/readGenshinDb";
import { readLanguageNames } from "#src/services/readLanguageNames";
import { readWikiStoryLines } from "#src/services/readWikiStoryLines";

// Every line the character speaks in the interface language, as a person reads it; `checkIsOwnVoiceLine` is the
// Authoring command's cut. The wiki that carries a character the data package has no lines for yet is English only,
// So under any other language that character has none here and the spinner shows their description instead — one
// Script in the spinner rather than two
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
  else return language === DEFAULT_LANGUAGE ? readWikiStoryLines(name) : Promise.resolve([]);
};
