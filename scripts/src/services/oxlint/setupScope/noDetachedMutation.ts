import type { ESTree, Rule } from "@oxlint/plugins";

import { checkIsSetupFunction } from "#src/services/oxlint/setupScope/checkIsSetupFunction";
import { MESSAGE } from "#src/services/oxlint/setupScope/constants";
import { defineRule } from "@oxlint/plugins";

export const noDetachedMutation: Rule = defineRule({
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "useMutation") return;

        let ancestor: ESTree.Node | null = node.parent;
        while (
          ancestor &&
          ancestor.type !== "ArrowFunctionExpression" &&
          ancestor.type !== "FunctionDeclaration" &&
          ancestor.type !== "FunctionExpression"
        )
          ancestor = ancestor.parent;
        // Outside every function is a component's `<script setup>`, whose top level is its setup
        if (ancestor && !checkIsSetupFunction(ancestor)) context.report({ message: MESSAGE, node });
      },
    };
  },
  meta: { type: "problem" },
});
