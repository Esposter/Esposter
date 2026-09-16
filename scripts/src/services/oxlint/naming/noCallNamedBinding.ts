import type { Rule } from "@oxlint/plugins";

import { MESSAGE, VERB_PREFIX_REGEX } from "#src/services/oxlint/naming/constants";
import { getCalleeName } from "#src/services/oxlint/naming/getCalleeName";
import { defineRule } from "@oxlint/plugins";

export const noCallNamedBinding: Rule = defineRule({
  create(context) {
    return {
      VariableDeclarator(node) {
        if (
          node.id.type === "Identifier" &&
          VERB_PREFIX_REGEX.test(node.id.name) &&
          getCalleeName(node.init) === node.id.name
        )
          context.report({ message: MESSAGE, node: node.id });
      },
    };
  },
  meta: { type: "suggestion" },
});
