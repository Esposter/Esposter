import type { Rule } from "@oxlint/plugins";

import { createFirstVisitGuard } from "#src/services/oxlint/sorting/createFirstVisitGuard";
import { reportUnsorted } from "#src/services/oxlint/sorting/reportUnsorted";
import { defineRule } from "@oxlint/plugins";

// A union's members by their source text, so `"a" | "b"` and `A | B` both read in order
const sortUnionTypes: Rule = defineRule({
  create(context) {
    const checkIsFirstVisit = createFirstVisitGuard();
    return {
      TSUnionType(node) {
        if (!checkIsFirstVisit(node)) return;
        reportUnsorted(
          context,
          node.types.map((type) => ({ name: context.sourceCode.getText(type), node: type })),
        );
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortUnionTypes;
