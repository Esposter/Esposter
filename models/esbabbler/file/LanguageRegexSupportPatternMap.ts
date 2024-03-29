import { escapeRegExp } from "@/util/escapeRegExp";
import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";

export const extendedLanguages = languages.concat(
  LanguageDescription.of({
    name: "Vue",
    extensions: ["vue"],
    load: () => import("@codemirror/lang-vue").then((m) => m.vue()),
  }),
);

const getLanguageRegexSupportPattern = (supportedExtensions: string) =>
  supportedExtensions.includes("^")
    ? supportedExtensions.replaceAll(/\|(\^)?/g, (_, b) => `$|${b ? "^" : "^.*\\."}$`)
    : `^.*\\.(${supportedExtensions})$`;

export const LanguageRegexSupportPatternMap = extendedLanguages.reduce<Record<string, string>>((acc, curr) => {
  acc[curr.name] = getLanguageRegexSupportPattern(curr.extensions.map((ext) => escapeRegExp(ext)).join("|"));
  return acc;
}, {});
export type LanguageRegexSupportPatternMap = typeof LanguageRegexSupportPatternMap;
