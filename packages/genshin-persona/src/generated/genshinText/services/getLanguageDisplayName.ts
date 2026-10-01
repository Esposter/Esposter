// Copied from `genshin-text` by `pnpm -C scripts genshin:text write`, never edited by hand
import { checkIsGameLanguage } from "#src/generated/genshinText/services/checkIsGameLanguage";
import { GameLanguageTagMap } from "#src/generated/genshinText/services/GameLanguageTagMap";

// A language as it is written in another — Japanese named in Japanese is 日本語, and named in English is Japanese.
// The runtime already knows every one of these, so all this needs beyond the language is its BCP-47 tag. A name
// Either side of the pair that is not one of the game's languages falls back to the name as given, which is also
// The word a person types, so the fallback is always something they recognise
export const getLanguageDisplayName = (languageName: string, inLanguageName: string): string => {
  if (!checkIsGameLanguage(languageName) || !checkIsGameLanguage(inLanguageName)) return languageName;

  const displayNames = new Intl.DisplayNames([GameLanguageTagMap[inLanguageName]], { type: "language" });
  return displayNames.of(GameLanguageTagMap[languageName]) ?? languageName;
};
