import type { Rule } from "@oxlint/plugins";

import { MESSAGE } from "#src/services/oxlint/errorAlert/constants";
import { defineRule } from "@oxlint/plugins";

export const noRawErrorAlert: Rule = defineRule({
  create: (context) => ({
    CallExpression(node) {
      if (node.callee.type !== "Identifier" || node.callee.name !== "createAlert") return;
      const [text] = node.arguments;
      if (text?.type !== "MemberExpression" || text.computed) return;
      else if (text.property.type !== "Identifier" || text.property.name !== "message") return;

      context.report({ message: MESSAGE, node });
    },
  }),
  meta: { type: "suggestion" },
});
