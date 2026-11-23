import type { ESTree, Rule } from "@oxlint/plugins";

import { SELECTOR_BAN_LISTS } from "#src/services/oxlint/selectorBan/selectorBanLists";
import { defineRule } from "@oxlint/plugins";
import { matchesGlob, relative } from "node:path";

// ESLint's `no-restricted-syntax` as an oxlint visitor over the lists under `syntaxes/`. Each list states the paths it
// Runs over, so a file takes every list whose scope matches it, and the configuration names the rule alone. oxlint
// Matches each selector itself, so the rule keeps no matcher of its own: a selector is a visitor key, and bans sharing
// One are grouped under it, since a key is unique
export const noRestrictedSyntax: Rule = defineRule({
  create(context) {
    const path = relative(context.cwd, context.filename).replaceAll("\\", "/");
    const checkIsMatched = (globs: string[] = []) => globs.some((glob) => matchesGlob(path, glob));
    const fileBans = SELECTOR_BAN_LISTS.filter(
      ({ excludeFiles, files }) => checkIsMatched(files) && !checkIsMatched(excludeFiles),
    ).flatMap(({ bans }) => bans);
    return Object.fromEntries(
      Array.from(
        Map.groupBy(fileBans, ({ selector }) => selector),
        ([selector, selectorBans]) => [
          selector,
          (node: ESTree.Node) => {
            for (const { message } of selectorBans) context.report({ message, node });
          },
        ],
      ),
    );
  },
  meta: { type: "suggestion" },
});
