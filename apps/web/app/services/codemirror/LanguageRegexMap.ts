import { EXTENDED_LANGUAGES } from "@/services/codemirror/constants";

// Keyed by language name, because that is what `getLanguage` hands back and `getLanguageExtension` takes.
// Every extension is escaped: `c++` and `cmake.in` are real entries, and their punctuation is literal.
// The dialects that carry none (the SQL family, which `language-data` reaches by name only) are dropped rather
// Than given an empty alternation, which is a pattern matching every name that ends in a dot
export const LanguageRegexMap = Object.fromEntries(
  EXTENDED_LANGUAGES.filter(({ extensions }) => extensions.length > 0).map(({ extensions, name }) => [
    name,
    new RegExp(String.raw`^.*\.(${extensions.map((extension) => RegExp.escape(extension)).join("|")})$`, "u"),
  ]),
);
