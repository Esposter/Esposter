import type { SubCommandsDef } from "citty";

import { DEFAULT_LANGUAGES_ARGUMENT, REVERSE_MATCH_LIMIT } from "#src/services/genshinText/constants";
import { formatGameTextMatch } from "#src/services/genshinText/formatGameTextMatch";
import { getRequestedLanguages } from "#src/services/genshinText/getRequestedLanguages";
import { isShownGameText } from "#src/services/genshinText/isShownGameText";
import { readGameTextMatches } from "#src/services/genshinText/readGameTextMatches";
import { defineCommand } from "citty";

export const reverseCommand: SubCommandsDef[string] = defineCommand({
  args: {
    exact: { default: false, description: "Match the shown text's case as well", type: "boolean" },
    json: { default: false, description: "Print each match as a JSON line", type: "boolean" },
    languages: {
      default: DEFAULT_LANGUAGES_ARGUMENT,
      description: "The languages to print each match in, by tag and comma-separated, or all",
      type: "string",
    },
    shown: {
      description: "The English text as the game shows it, its colour tags and placeholder marker aside",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description: "Print the id and GameTextKey member of every game string whose English the shown text equals",
    name: "reverse",
  },
  run: ({ args }) => {
    const languages = getRequestedLanguages(args.languages);
    const matches = readGameTextMatches((text) => isShownGameText(text, args.shown, args.exact), languages);
    const listedMatches = matches.slice(0, REVERSE_MATCH_LIMIT);
    for (const match of listedMatches) console.log(formatGameTextMatch(match, languages, args.json));

    const truncated = matches.length - listedMatches.length;
    if (truncated > 0) console.log(args.json ? JSON.stringify({ truncated }) : `${truncated} more matches not listed`);
  },
});
