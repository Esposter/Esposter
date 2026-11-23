import type { Rule } from "@oxlint/plugins";

import { reportAttributes } from "#src/services/oxlint/sorting/reportAttributes";
import { defineRule } from "@oxlint/plugins";

const sortImportAttributes: Rule = defineRule({
  create(context) {
    return {
      ImportDeclaration(node) {
        reportAttributes(context, node.attributes);
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortImportAttributes;
