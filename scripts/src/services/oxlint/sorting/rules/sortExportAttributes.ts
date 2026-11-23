import type { Rule } from "@oxlint/plugins";

import { reportAttributes } from "#src/services/oxlint/sorting/reportAttributes";
import { defineRule } from "@oxlint/plugins";

// Only a named export's attributes are sorted, as perfectionist's rule visits that node alone
const sortExportAttributes: Rule = defineRule({
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        reportAttributes(context, node.attributes);
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortExportAttributes;
