import type { Rule } from "@oxlint/plugins";

import { MESSAGE } from "#src/services/oxlint/errorHandling/constants";
import { defineRule } from "@oxlint/plugins";

export const noBareError: Rule = defineRule({
  create(context) {
    return {
      NewExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "Error")
          context.report({ message: MESSAGE, node });
      },
    };
  },
  meta: { type: "suggestion" },
});
