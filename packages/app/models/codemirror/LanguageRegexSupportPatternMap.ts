import { extendedLanguages } from "@/services/codemirror/extendedLanguages";
import { getLanguageRegexSupportPattern } from "@/services/codemirror/getLanguageRegexSupportPattern";
import { escapeRegExp } from "@/util/regex/escapeRegExp";

export const LanguageRegexSupportPatternMap = extendedLanguages.reduce<Record<string, string>>((acc, curr) => {
  acc[curr.name] = getLanguageRegexSupportPattern(curr.extensions.map((ext) => escapeRegExp(ext)).join("|"));
  return acc;
}, {});
export type LanguageRegexSupportPatternMap = typeof LanguageRegexSupportPatternMap;
