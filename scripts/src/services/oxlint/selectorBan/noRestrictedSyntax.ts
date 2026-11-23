import type { SelectorBan } from "#src/models/oxlint/selectorBan/SelectorBan";
import type { ESTree, Rule } from "@oxlint/plugins";

import { defineRule } from "@oxlint/plugins";

// ESLint's `no-restricted-syntax` as an oxlint visitor: each ban's selector is a visitor key and its message is reported
// At every node the selector matches. oxlint matches the selector itself, so the rule keeps no matcher of its own. Two
// Bans may share a selector and a visitor key is unique, so they are grouped by it and each message is reported. With
// No options the visitor is empty, so the plugin reports nothing until a configuration names a ban.
export const noRestrictedSyntax: Rule = defineRule({
  create(context) {
    // The schema admits a string or a message and selector pair, so anything else never reaches here
    const bans = context.options.flatMap((option): SelectorBan[] => {
      if (typeof option === "string") return [{ message: `Using '${option}' is not allowed.`, selector: option }];
      if (typeof option !== "object" || option === null || Array.isArray(option)) return [];
      const { message, selector } = option;
      return typeof message === "string" && typeof selector === "string" ? [{ message, selector }] : [];
    });
    const selectorBansMap = Map.groupBy(bans, ({ selector }) => selector);

    return Object.fromEntries(
      [...selectorBansMap].map(([selector, selectorBans]) => [
        selector,
        (node: ESTree.Node) => {
          for (const { message } of selectorBans) context.report({ message, node });
        },
      ]),
    );
  },
  // The options are the whole list of bans, as ESLint's schema describes them, so oxlint accepts a configuration that
  // Names them and rejects one that names anything else
  meta: {
    schema: {
      items: {
        anyOf: [
          { type: "string" },
          {
            additionalProperties: false,
            properties: { message: { type: "string" }, selector: { type: "string" } },
            required: ["message", "selector"],
            type: "object",
          },
        ],
      },
      type: "array",
    },
    type: "suggestion",
  },
});
