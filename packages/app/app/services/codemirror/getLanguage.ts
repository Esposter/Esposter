import { LanguageRegexSupportPatternMap } from "@/models/codemirror/LanguageRegexSupportPatternMap";

export const getLanguage = (filename: string) => {
  for (const [language, supportPattern] of Object.entries(LanguageRegexSupportPatternMap))
    if (filename.match(supportPattern)) return language;

  return undefined;
};
