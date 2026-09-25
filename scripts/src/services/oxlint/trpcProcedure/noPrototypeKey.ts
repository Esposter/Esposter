import type { Rule } from "@oxlint/plugins";

import { PROTOTYPE_KEY_MESSAGE, PROTOTYPE_KEYS } from "#src/services/oxlint/trpcProcedure/constants";
import { defineRule } from "@oxlint/plugins";

export const noPrototypeKey: Rule = defineRule({
  create(context) {
    return {
      CallExpression(node) {
        const { arguments: callArguments, callee } = node;
        if (callee.type !== "Identifier" || callee.name !== "router") return;
        const [routes] = callArguments;
        if (routes?.type !== "ObjectExpression") return;

        for (const property of routes.properties)
          if (
            property.type === "Property" &&
            !property.computed &&
            property.key.type === "Identifier" &&
            PROTOTYPE_KEYS.has(property.key.name)
          )
            context.report({ message: PROTOTYPE_KEY_MESSAGE, node: property.key });
      },
    };
  },
  meta: { type: "suggestion" },
});
