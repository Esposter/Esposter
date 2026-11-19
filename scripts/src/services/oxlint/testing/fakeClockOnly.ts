import type { Rule } from "@oxlint/plugins";

import { checkIsUseFakeTimersCall } from "#src/services/oxlint/testing/checkIsUseFakeTimersCall";
import {
  FAKE_CLOCK_ONLY_MESSAGE,
  FAKEABLE_CLOCKS,
  MINIFLARE_MODULE,
  MINIFLARE_MODULE_SUFFIX,
} from "#src/services/oxlint/testing/constants";
import { getFakedTimerNames } from "#src/services/oxlint/testing/getFakedTimerNames";
import { defineRule } from "@oxlint/plugins";

export const fakeClockOnly: Rule = defineRule({
  create(context) {
    let isBootingMiniflare = false;
    return {
      CallExpression(node) {
        if (!isBootingMiniflare || !checkIsUseFakeTimersCall(node)) return;
        const fakedTimerNames = getFakedTimerNames(node.arguments[0]);
        if (fakedTimerNames === undefined || !fakedTimerNames.every((name) => FAKEABLE_CLOCKS.includes(name)))
          context.report({ message: FAKE_CLOCK_ONLY_MESSAGE, node });
      },
      ImportDeclaration(node) {
        if (node.source.value === MINIFLARE_MODULE || node.source.value.endsWith(MINIFLARE_MODULE_SUFFIX))
          isBootingMiniflare = true;
      },
    };
  },
  meta: { type: "problem" },
});
