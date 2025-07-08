import { escapeRegExp } from "#shared/util/regex/escapeRegExp";
import { extendedLanguages } from "@/services/codemirror/extendedLanguages";
import { getLanguageRegexSupportPattern } from "@/services/codemirror/getLanguageRegexSupportPattern";

export const LanguageRegexSupportPatternMap = extendedLanguages.reduce<Record<string, RegExp>>((acc, curr) => {
  acc[curr.name] = getLanguageRegexSupportPattern(curr.extensions.map((ext) => escapeRegExp(ext)).join("|"));
  return acc;
}, {});
export type LanguageRegexSupportPatternMap = typeof LanguageRegexSupportPatternMap;
