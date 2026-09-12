import type { Rule } from "@oxlint/plugins";

import { checkIsStringLiteralType } from "#src/services/oxlint/literalUnion/checkIsStringLiteralType";
import { MESSAGE } from "#src/services/oxlint/literalUnion/constants";
import { defineRule } from "@oxlint/plugins";

export const noStringLiteralUnion: Rule = defineRule({
  create(context) {
    // Oxlint hands a union inside a type annotation to the visitor twice, so a report is keyed by where it starts
    const reportedStarts = new Set<number>();
    return {
      TSUnionType(node) {
        if (reportedStarts.has(node.start)) return;
        // A parenthesised union is the same argument: `Record<("a" | "b"), T>` is still a set of keys
        let parent = node.parent;
        while (parent.type === "TSParenthesizedType") parent = parent.parent;
        if (parent.type === "TSTypeParameterInstantiation") return;
        const stringLiteralCount = node.types.filter((type) => checkIsStringLiteralType(type)).length;
        if (stringLiteralCount < 2) return;
        reportedStarts.add(node.start);
        context.report({ message: MESSAGE, node });
      },
    };
  },
  meta: { type: "suggestion" },
});
