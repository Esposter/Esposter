import type { Rule } from "@oxlint/plugins";

import { checkIsFakingSetTimeout } from "#src/services/oxlint/testing/checkIsFakingSetTimeout";
import { MESSAGE, MSW_TRPC_MODULE_SUFFIX } from "#src/services/oxlint/testing/constants";
import { defineRule } from "@oxlint/plugins";

export const noFakedSetTimeout: Rule = defineRule({
  create(context) {
    let isAnsweringTRPC = false;
    return {
      CallExpression(node) {
        const { callee } = node;
        if (
          isAnsweringTRPC &&
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "vi" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "useFakeTimers" &&
          checkIsFakingSetTimeout(node.arguments[0])
        )
          context.report({ message: MESSAGE, node });
      },
      ImportDeclaration(node) {
        if (node.source.value.endsWith(MSW_TRPC_MODULE_SUFFIX)) isAnsweringTRPC = true;
      },
    };
  },
  meta: { type: "problem" },
});
