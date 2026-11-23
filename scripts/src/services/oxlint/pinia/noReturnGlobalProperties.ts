import type { Rule } from "@oxlint/plugins";

import { buildGlobalPropertyMessage, GLOBAL_CALLEE_NAMES } from "#src/services/oxlint/pinia/constants";
import { defineRule } from "@oxlint/plugins";

export const noReturnGlobalProperties: Rule = defineRule({
  create(context) {
    // The names bound to a global call. A destructured binding names nothing, so it adds none
    const globalNames = new Set<string>();
    return {
      VariableDeclaration(node) {
        for (const { id, init } of node.declarations) {
          if (
            id.type === "Identifier" &&
            init?.type === "CallExpression" &&
            init.callee.type === "Identifier" &&
            GLOBAL_CALLEE_NAMES.has(init.callee.name)
          )
            globalNames.add(id.name);
        }
      },
      ReturnStatement(node) {
        if (node.argument?.type !== "ObjectExpression") return;

        for (const property of node.argument.properties) {
          if (property.type !== "Property" || property.value.type !== "Identifier") continue;
          if (globalNames.has(property.value.name))
            context.report({ message: buildGlobalPropertyMessage(property.value.name), node: property });
        }
      },
    };
  },
  meta: { type: "problem" },
});
