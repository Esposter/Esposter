import { LanguageRegexSupportPatternMap } from "@/models/codemirror/LanguageRegexSupportPatternMap";
import { getFilename } from "@/util/getFilename";

export const getLanguageForFileUrl = (url: string) => {
  const filename = getFilename(url).toLowerCase();

  for (const [language, supportPattern] of Object.entries(LanguageRegexSupportPatternMap))
    if (filename.match(supportPattern)) return language;

  return null;
};
