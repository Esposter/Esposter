import type { Rule } from "@oxlint/plugins";

import { checkIsForwardingArrow } from "#src/services/oxlint/passThroughHelper/checkIsForwardingArrow";
import { MESSAGE } from "#src/services/oxlint/passThroughHelper/constants";
import { defineRule } from "@oxlint/plugins";

export const noForwardingWrapper: Rule = defineRule({
  create(context) {
    // An exported arrow reaches the surface either named or as the module's default, and the two shapes forward
    // Identically, so both visitors hand their arrow here.
    return {
      ExportDefaultDeclaration(node) {
        if (node.declaration.type === "ArrowFunctionExpression" && checkIsForwardingArrow(node.declaration))
          context.report({ message: MESSAGE, node: node.declaration });
      },
      ExportNamedDeclaration(node) {
        if (node.declaration?.type !== "VariableDeclaration") return;
        for (const { init } of node.declaration.declarations)
          if (init?.type === "ArrowFunctionExpression" && checkIsForwardingArrow(init))
            context.report({ message: MESSAGE, node: init });
      },
    };
  },
  meta: { type: "suggestion" },
});
