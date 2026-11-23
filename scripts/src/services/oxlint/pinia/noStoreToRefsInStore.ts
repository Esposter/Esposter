import type { Rule } from "@oxlint/plugins";

import { checkIsDefineStore } from "#src/services/oxlint/pinia/checkIsDefineStore";
import { STORE_TO_REFS_MESSAGE, STORE_TO_REFS_NAME } from "#src/services/oxlint/pinia/constants";
import { defineRule } from "@oxlint/plugins";

export const noStoreToRefsInStore: Rule = defineRule({
  create(context) {
    return {
      CallExpression(node) {
        if (!checkIsDefineStore(node) || node.arguments.length < 2) return;

        const [, setup] = node.arguments;
        if (setup?.type !== "ArrowFunctionExpression" && setup?.type !== "FunctionExpression") return;
        if (setup.body.type !== "BlockStatement") return;

        for (const statement of setup.body.body) {
          if (statement.type !== "VariableDeclaration") continue;

          for (const { init } of statement.declarations)
            if (
              init?.type === "CallExpression" &&
              init.callee.type === "Identifier" &&
              init.callee.name === STORE_TO_REFS_NAME
            )
              context.report({ message: STORE_TO_REFS_MESSAGE, node: init.callee });
        }
      },
    };
  },
  meta: { type: "problem" },
});
