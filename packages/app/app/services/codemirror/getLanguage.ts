import { LanguageRegexSupportPatternMap } from "@/models/codemirror/LanguageRegexSupportPatternMap";

export const getLanguage = (filename: string) => {
  for (const [language, supportPattern] of Object.entries(LanguageRegexSupportPatternMap))
    if (supportPattern.test(filename)) return language;

  return null;
};
