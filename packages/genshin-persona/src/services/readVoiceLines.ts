import type { VoiceLine } from "#src/models/VoiceLine";

import { CharacterLinesLoaderMap } from "#src/generated/CharacterLinesLoaderMap";
import { TravelerGender } from "#src/generated/genshinText/models/TravelerGender";
import { fillLinePlaceholders } from "#src/generated/genshinText/services/fillLinePlaceholders";
import { getCanonicalLanguage } from "#src/generated/genshinText/services/getCanonicalLanguage";
import { DEFAULT_LANGUAGE, TravelerTwinMap } from "#src/services/constants";
import { getPlainLineText } from "#src/services/getPlainLineText";
import { readGenshinDb } from "#src/services/readGenshinDb";

// Every line the character speaks in the interface language, as a person reads it; `checkIsOwnVoiceLine` is the
// Authoring command's cut. The lines are the game data's, or — for a character the data package carries no lines
// For yet — the game's own text, which `genshin:text write` reads for every language the game has and the persona
// Carries generated, so the newest characters speak in all fifteen rather than waiting on a bump. Either way the
// Nickname is filled with the character's own name as the interface language spells it, the name the tips already
// Run under, and a word per gender takes a twin's own gender, else the male form. A character neither has lines for
// Has none here and the spinner shows their description instead. A language the game does not name answers in
// English throughout
export const readVoiceLines = async (name: string, language: string): Promise<VoiceLine[]> => {
  const genshindb = readGenshinDb();
  const resultLanguage = getCanonicalLanguage(language) ?? DEFAULT_LANGUAGE;
  const queryOptions = {
    queryLanguages: [genshindb.Language.English],
    resultLanguage: genshindb.Language[resultLanguage],
  };
  const friendLines = genshindb.voiceovers(name, queryOptions)?.friendLines ?? [];
  const lines =
    friendLines.length > 0
      ? friendLines.map(({ description, title }) => ({ text: description, title }))
      : ((await CharacterLinesLoaderMap[resultLanguage]())[name] ?? []);
  const nickname = genshindb.characters(name, queryOptions)?.name ?? name;
  const gender = TravelerTwinMap[name]?.gender ?? TravelerGender.Male;
  return lines.map(({ text, title }) => ({
    text: getPlainLineText(fillLinePlaceholders(text, nickname, gender)),
    title: title.trim(),
  }));
};
