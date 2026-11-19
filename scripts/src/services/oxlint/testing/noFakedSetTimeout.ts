import type { Rule } from "@oxlint/plugins";

import { checkIsUseFakeTimersCall } from "#src/services/oxlint/testing/checkIsUseFakeTimersCall";
import { FAKED_TIMER, MESSAGE, MSW_TRPC_MODULE_SUFFIX } from "#src/services/oxlint/testing/constants";
import { getFakedTimerNames } from "#src/services/oxlint/testing/getFakedTimerNames";
import { defineRule } from "@oxlint/plugins";

export const noFakedSetTimeout: Rule = defineRule({
  create(context) {
    let isAnsweringTRPC = false;
    return {
      CallExpression(node) {
        if (!isAnsweringTRPC || !checkIsUseFakeTimersCall(node)) return;
        const fakedTimerNames = getFakedTimerNames(node.arguments[0]);
        if (fakedTimerNames === undefined || fakedTimerNames.includes(FAKED_TIMER))
          context.report({ message: MESSAGE, node });
      },
      ImportDeclaration(node) {
        if (node.source.value.endsWith(MSW_TRPC_MODULE_SUFFIX)) isAnsweringTRPC = true;
      },
    };
  },
  meta: { type: "problem" },
});
