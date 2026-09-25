import type { Rule } from "@oxlint/plugins";

import { MESSAGE } from "#src/services/oxlint/templateRef/constants";
import { defineRule } from "@oxlint/plugins";

export const requireRefName: Rule = defineRule({
  create(context) {
    return {
      VariableDeclarator(node) {
        const { id, init } = node;
        if (id.type !== "Identifier" || init?.type !== "CallExpression") return;
        else if (init.callee.type !== "Identifier" || init.callee.name !== "useTemplateRef") return;

        const [key] = init.arguments;
        // A key computed at runtime names no attribute this file spells, so there is nothing to compare against
        if (key?.type !== "Literal" || typeof key.value !== "string") return;
        else if (id.name !== key.value || id.name.endsWith("Ref")) context.report({ message: MESSAGE, node: id });
      },
    };
  },
  meta: { type: "suggestion" },
});
