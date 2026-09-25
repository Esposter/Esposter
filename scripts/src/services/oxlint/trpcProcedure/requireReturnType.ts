import type { Rule } from "@oxlint/plugins";

import { MISSING_RETURN_TYPE } from "#src/services/oxlint/trpcProcedure/constants";
import { defineRule } from "@oxlint/plugins";

export const requireReturnType: Rule = defineRule({
  create(context) {
    return {
      CallExpression(node) {
        const {
          arguments: [handler],
          callee,
          typeArguments,
        } = node;
        if (typeArguments) return;
        else if (callee.type !== "MemberExpression" || callee.computed) return;
        else if (callee.property.type !== "Identifier") return;
        // `.subscription` is deliberately absent: an async generator carries its yield type as a callback
        // Annotation, which is the one place the skill's method-generic rule does not reach
        else if (callee.property.name !== "query" && callee.property.name !== "mutation") return;
        // A procedure is defined by the handler it is written with, so a `.query(`/`.mutation(` handed anything
        // Else — a client call's input, a driver's SQL string — is some other API that shares the method name
        else if (handler?.type !== "ArrowFunctionExpression" && handler?.type !== "FunctionExpression") return;

        context.report({ message: MISSING_RETURN_TYPE, node });
      },
    };
  },
  meta: { type: "suggestion" },
});
