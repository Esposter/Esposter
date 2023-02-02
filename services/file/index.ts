import { LanguageRegexSupportMap } from "@/models/file";

export const getLanguageForUrl = (url: string) => {
  const filename = url.substring(url.lastIndexOf("/") + 1).toLowerCase();

  for (const [language, supportPattern] of Object.entries(LanguageRegexSupportMap))
    if (filename.match(supportPattern)) return language;

  return null;
};
