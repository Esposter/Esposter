import { LanguageLocaleMap } from "#src/services/constants";

// A language as it is written in another — Japanese named in Japanese is 日本語, and named in English is Japanese.
// The runtime already knows every one of these, so the only thing this needs beyond the data package's own name is
// That name's BCP-47 tag. A language either side of the pair has no tag for falls back to the package's English
// Word for it, which is also the word a person types, so the fallback is always something they recognise
export const getLanguageDisplayName = (languageName: string, inLanguageName: string): string => {
  const languageTag = LanguageLocaleMap[languageName];
  const inLanguageTag = LanguageLocaleMap[inLanguageName];
  if (!languageTag || !inLanguageTag) return languageName;

  return new Intl.DisplayNames([inLanguageTag], { type: "language" }).of(languageTag) ?? languageName;
};
