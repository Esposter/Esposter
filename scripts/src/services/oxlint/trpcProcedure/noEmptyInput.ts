import type { Rule } from "@oxlint/plugins";

import { EMPTY_INPUT_MESSAGE } from "#src/services/oxlint/trpcProcedure/constants";
import { defineRule } from "@oxlint/plugins";

export const noEmptyInput: Rule = defineRule({
  create(context) {
    return {
      CallExpression(node) {
        const { arguments: callArguments, callee } = node;
        if (callee.type !== "MemberExpression" || callee.computed || callee.property.type !== "Identifier") return;
        else if (callee.property.name !== "query" && callee.property.name !== "mutate") return;

        const [input] = callArguments;
        if (callArguments.length === 1 && input?.type === "ObjectExpression" && input.properties.length === 0)
          context.report({ message: EMPTY_INPUT_MESSAGE, node: input });
      },
    };
  },
  meta: { type: "suggestion" },
});
