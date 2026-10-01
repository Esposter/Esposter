import type { SubCommandsDef } from "citty";

import { findGameText } from "#src/services/genshinText/findGameText";
import { defineCommand } from "citty";

export const findCommand: SubCommandsDef[string] = defineCommand({
  args: { pattern: { description: "A regular expression over the English text", required: true, type: "positional" } },
  meta: { description: "Print the id a GameTextKey takes for every English string the pattern matches", name: "find" },
  run: ({ args }) => {
    for (const line of findGameText(args.pattern)) console.log(line);
  },
});
