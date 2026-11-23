import type { Rule } from "@oxlint/plugins";

import { reportUnsorted } from "#src/services/oxlint/sorting/reportUnsorted";
import { defineRule } from "@oxlint/plugins";

// A named export's specifiers by the name each one exports, which is its alias when it has one
const sortNamedExports: Rule = defineRule({
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        reportUnsorted(
          context,
          node.specifiers.map((specifier) => ({
            name: specifier.exported.type === "Identifier" ? specifier.exported.name : specifier.exported.value,
            node: specifier,
          })),
        );
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortNamedExports;
