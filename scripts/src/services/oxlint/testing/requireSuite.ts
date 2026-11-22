import type { Rule } from "@oxlint/plugins";

import { REQUIRE_SUITE_MESSAGE, SUITE_CALLEES } from "#src/services/oxlint/testing/constants";
import { getCalleeRootName } from "#src/services/oxlint/testing/getCalleeRootName";
import { defineRule } from "@oxlint/plugins";

export const requireSuite: Rule = defineRule({
  create(context) {
    let isDeclaringSuite = false;
    return {
      CallExpression({ callee }) {
        const name = getCalleeRootName(callee);
        if (name !== undefined && SUITE_CALLEES.includes(name)) isDeclaringSuite = true;
      },
      "Program:exit"(node) {
        if (!isDeclaringSuite) context.report({ message: REQUIRE_SUITE_MESSAGE, node });
      },
    };
  },
  meta: { type: "problem" },
});
