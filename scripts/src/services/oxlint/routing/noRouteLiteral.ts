import type { Rule } from "@oxlint/plugins";

import { checkIsRouteSpelling } from "#src/services/oxlint/routing/checkIsRouteSpelling";
import { MESSAGE } from "#src/services/oxlint/routing/constants";
import { defineRule } from "@oxlint/plugins";

export const noRouteLiteral: Rule = defineRule({
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === "string" && checkIsRouteSpelling(node.value))
          context.report({ message: MESSAGE, node });
      },
      // Only the string's opening piece can spell a route: a later one (`${section}/calls`) is a segment of another path
      TemplateLiteral(node) {
        const [head] = node.quasis;
        if (head && checkIsRouteSpelling(head.value.cooked ?? "")) context.report({ message: MESSAGE, node: head });
      },
    };
  },
  meta: { type: "suggestion" },
});
