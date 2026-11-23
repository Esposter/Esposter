import type { Plugin, Rule } from "@oxlint/plugins";

import { definePlugin } from "@oxlint/plugins";
import { readdirSync } from "node:fs";

const RULES_DIRECTORY = new URL("../services/oxlint/sorting/rules/", import.meta.url);

// The sort rules perfectionist's natural preset ran, each one a module under `rules/` named after its rule, so a rule
// Is named by its file. They share one comparator and one set of reporters, and read the scope manager as well as the
// Node and its source text
const plugin: Plugin = definePlugin({
  meta: { name: "sorting" },
  rules: Object.fromEntries(
    await Promise.all(
      readdirSync(RULES_DIRECTORY)
        .filter((fileName) => fileName.endsWith(".ts") && !fileName.endsWith(".test.ts"))
        .map(async (fileName): Promise<[string, Rule]> => {
          // oxlint-disable-next-line selector-ban/no-restricted-syntax -- the rules are discovered from their folder at load, so each is imported where its file name is read, not by a static list
          const { default: rule } = await import(new URL(fileName, RULES_DIRECTORY).href);
          return [fileName.slice(0, -".ts".length).replaceAll(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`), rule];
        }),
    ),
  ),
});

export default plugin;
