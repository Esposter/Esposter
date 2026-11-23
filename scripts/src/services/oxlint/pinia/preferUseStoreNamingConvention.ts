import type { Rule } from "@oxlint/plugins";

import { checkIsDefineStore } from "#src/services/oxlint/pinia/checkIsDefineStore";
import { INCORRECT_PREFIX_MESSAGE, STORE_NAME_PREFIX_REGEX } from "#src/services/oxlint/pinia/constants";
import { getStoreId } from "#src/services/oxlint/pinia/getStoreId";
import { defineRule } from "@oxlint/plugins";

export const preferUseStoreNamingConvention: Rule = defineRule({
  create(context) {
    return {
      CallExpression(node) {
        if (!checkIsDefineStore(node) || node.arguments.length < 2 || getStoreId(node) === undefined) return;

        // A store exported by default or passed on has no binding to name, so only a declarator is checked
        const { parent } = node;
        if (parent.type !== "VariableDeclarator" || parent.id.type !== "Identifier") return;
        if (!STORE_NAME_PREFIX_REGEX.test(parent.id.name))
          context.report({ message: INCORRECT_PREFIX_MESSAGE, node: parent });
      },
    };
  },
  meta: { type: "problem" },
});
