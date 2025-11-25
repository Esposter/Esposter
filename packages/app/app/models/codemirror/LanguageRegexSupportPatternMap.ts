import { extendedLanguages } from "@/services/codemirror/extendedLanguages";
import { getLanguageRegexSupportPattern } from "@/services/codemirror/getLanguageRegexSupportPattern";
import { escapeRegExp } from "@esposter/shared";

export const LanguageRegexSupportPatternMap = Object.fromEntries(
  extendedLanguages.map(({ extensions, name }) => [
    name,
    getLanguageRegexSupportPattern(extensions.map((ext) => escapeRegExp(ext)).join("|")),
  ]),
);
export type LanguageRegexSupportPatternMap = typeof LanguageRegexSupportPatternMap;
