import type { ESTree, Rule } from "@oxlint/plugins";

import { reportUnsorted } from "#src/services/oxlint/sorting/reportUnsorted";
import { defineRule } from "@oxlint/plugins";

// A named import's specifiers by the local name each one binds, leaving out the default and namespace specifiers
const sortNamedImports: Rule = defineRule({
  create(context) {
    return {
      ImportDeclaration(node) {
        const specifiers = node.specifiers.filter(
          (specifier): specifier is ESTree.ImportSpecifier => specifier.type === "ImportSpecifier",
        );
        reportUnsorted(
          context,
          specifiers.map((specifier) => ({ name: specifier.local.name, node: specifier })),
        );
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortNamedImports;
