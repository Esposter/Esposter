import type { Rule } from "@oxlint/plugins";

import { NAME_MESSAGE, STORE_HOOK_REGEX, UNNAMED_MESSAGE } from "#src/services/oxlint/piniaStore/constants";
import { defineRule } from "@oxlint/plugins";

export const requireStoreBinding: Rule = defineRule({
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier") return;

        const storeName = STORE_HOOK_REGEX.exec(node.callee.name)?.groups?.storeName;
        if (!storeName) return;
        // A runtime choice between stores is still one store once chosen, so the ternary is looked through to
        // Where its value lands — but which of the two names the binding should spell is the reader's call
        let value: typeof node.parent = node;
        while (value.parent.type === "ConditionalExpression" && value.parent.test !== value) value = value.parent;

        const { parent } = value;
        // A call for its side effect has nothing to name, and a function returning the store hands the naming to
        // Whoever calls it — a selector like `useBattleMonsterStore`, or a test's setup helper
        if (
          parent.type === "ExpressionStatement" ||
          parent.type === "ReturnStatement" ||
          (parent.type === "ArrowFunctionExpression" && parent.body === value)
        )
          return;

        const binding =
          parent.type === "VariableDeclarator" && parent.init === value
            ? parent.id
            : parent.type === "AssignmentExpression" && parent.right === value
              ? parent.left
              : undefined;
        if (binding?.type !== "Identifier") context.report({ message: UNNAMED_MESSAGE, node });
        else if (
          value === node &&
          !`${binding.name.charAt(0).toUpperCase()}${binding.name.slice(1)}`.endsWith(storeName)
        )
          context.report({ message: NAME_MESSAGE, node: binding });
      },
    };
  },
  meta: { type: "suggestion" },
});
