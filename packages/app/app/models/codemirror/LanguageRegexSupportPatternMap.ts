import { extendedLanguages } from "@/services/codemirror/extendedLanguages";
import { getLanguageRegexSupportPattern } from "@/services/codemirror/getLanguageRegexSupportPattern";
import { ID_SEPARATOR } from "@esposter/shared";

export const LanguageRegexSupportPatternMap = Object.fromEntries(
  extendedLanguages.map(({ extensions, name }) => [
    name,
    getLanguageRegexSupportPattern(extensions.map((extension) => RegExp.escape(extension)).join(ID_SEPARATOR)),
  ]),
);
export type LanguageRegexSupportPatternMap = typeof LanguageRegexSupportPatternMap;
