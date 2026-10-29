import type { SubCommandsDef } from "citty";

import { DEFAULT_LANGUAGES_ARGUMENT } from "#src/services/genshinText/constants";
import { formatGameTextMatch } from "#src/services/genshinText/formatGameTextMatch";
import { getRequestedLanguages } from "#src/services/genshinText/getRequestedLanguages";
import { readGameTextMatches } from "#src/services/genshinText/readGameTextMatches";
import { defineCommand } from "citty";

export const findCommand: SubCommandsDef[string] = defineCommand({
  args: {
    id: {
      description:
        "A regular expression over the id instead, so a screen's own strings, which share its manual id's prefix (UI_FORGE_PAGE_), are listed whole",
      type: "boolean",
    },
    json: { default: false, description: "Print each match as a JSON line", type: "boolean" },
    languages: {
      default: DEFAULT_LANGUAGES_ARGUMENT,
      description: "The languages to print each match in, by tag and comma-separated, or all",
      type: "string",
    },
    pattern: { description: "A regular expression over the English text", required: true, type: "positional" },
  },
  meta: { description: "Print the id a GameTextKey takes for every English string the pattern matches", name: "find" },
  run: ({ args }) => {
    const regex = new RegExp(args.pattern, "u");
    const isMatch = (text: string, ids: string[]) => (args.id ? ids.some((id) => regex.test(id)) : regex.test(text));
    const languages = getRequestedLanguages(args.languages);
    for (const match of readGameTextMatches(isMatch, languages))
      console.log(formatGameTextMatch(match, languages, args.json));
  },
});
