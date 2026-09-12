import type { Rule } from "@oxlint/plugins";

import { MISSING_RETURN_TYPE } from "#src/services/oxlint/trpcProcedure/constants";
import { defineRule } from "@oxlint/plugins";

export const requireReturnType: Rule = defineRule({
  create(context) {
    return {
      CallExpression(node) {
        const { callee, typeArguments } = node;
        if (typeArguments) return;
        else if (callee.type !== "MemberExpression" || callee.computed) return;
        else if (callee.property.type !== "Identifier") return;
        // `.subscription` is deliberately absent: an async generator carries its yield type as a callback
        // Annotation, which is the one place the skill's method-generic rule does not reach
        else if (callee.property.name !== "query" && callee.property.name !== "mutation") return;
        // Drizzle's `ctx.db.query` is a property, never a call, so a `.query(` here is always a procedure —
        // But a callee that is itself a bare identifier call (`query(...)`) is not a builder chain
        else if (callee.object.type === "Identifier" && callee.object.name === "db") return;

        context.report({ message: MISSING_RETURN_TYPE, node });
      },
    };
  },
  meta: { type: "suggestion" },
});
