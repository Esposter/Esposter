import type { Rule } from "@oxlint/plugins";

import { QUERY_VERB_MESSAGE, QUERY_VERB_REGEX } from "#src/services/oxlint/trpcProcedure/constants";
import { defineRule } from "@oxlint/plugins";

export const requireQueryVerb: Rule = defineRule({
  create(context) {
    return {
      Property(node) {
        const { computed, key, value } = node;
        if (computed || key.type !== "Identifier" || value.type !== "CallExpression") return;
        const { callee } = value;
        // A procedure is a builder chain ending in `.query(…)`; Drizzle's `db.query` is a property, never a call
        if (callee.type !== "MemberExpression" || callee.computed || callee.property.type !== "Identifier") return;
        else if (callee.property.name !== "query" || QUERY_VERB_REGEX.test(key.name)) return;

        context.report({ message: QUERY_VERB_MESSAGE, node: key });
      },
    };
  },
  meta: { type: "suggestion" },
});
