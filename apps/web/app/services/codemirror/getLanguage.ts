import { LanguageRegexMap } from "@/services/codemirror/LanguageRegexMap";

export const getLanguage = (filename: string) => {
  for (const [language, regex] of Object.entries(LanguageRegexMap)) if (regex.test(filename)) return language;

  return undefined;
};
