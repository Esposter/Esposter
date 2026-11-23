import type { Rule } from "@oxlint/plugins";

import { checkIsDefineStore } from "#src/services/oxlint/pinia/checkIsDefineStore";
import { buildNamedExportMessage, DEFAULT_EXPORT_MESSAGE } from "#src/services/oxlint/pinia/constants";
import { getStoreId } from "#src/services/oxlint/pinia/getStoreId";
import { defineRule } from "@oxlint/plugins";

export const neverExportInitializedStore: Rule = defineRule({
  create(context) {
    // The stores this file defines, under the name each is bound to. A store defined in another file is not one this
    // file can see, so the verdict never depends on which file the linter read first
    const storeNames = new Set<string>();
    return {
      CallExpression(node) {
        if (!checkIsDefineStore(node) || node.arguments.length < 2 || getStoreId(node) === undefined) return;

        const { parent } = node;
        // An export default or a call inside another expression has no variable to bind the store to
        if (parent.type === "VariableDeclarator" && parent.id.type === "Identifier") storeNames.add(parent.id.name);
      },
      ExportDefaultDeclaration(node) {
        const { declaration } = node;
        if (
          declaration.type === "CallExpression" &&
          declaration.callee.type === "Identifier" &&
          storeNames.has(declaration.callee.name)
        )
          context.report({ message: DEFAULT_EXPORT_MESSAGE, node });
      },
      ExportNamedDeclaration(node) {
        if (node.declaration?.type !== "VariableDeclaration") return;

        for (const { init } of node.declaration.declarations) {
          if (init?.type !== "CallExpression" || init.callee.type !== "Identifier") continue;
          if (storeNames.has(init.callee.name))
            context.report({ message: buildNamedExportMessage(init.callee.name), node });
        }
      },
    };
  },
  meta: { type: "problem" },
});
