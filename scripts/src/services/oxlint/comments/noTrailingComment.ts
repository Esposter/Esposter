import type { Rule } from "@oxlint/plugins";

import {
  SAME_LINE_DIRECTIVE_REGEX,
  TERNARY_OPERATORS,
  TRAILING_COMMENT_MESSAGE,
} from "#src/services/oxlint/comments/constants";
import { defineRule } from "@oxlint/plugins";

export const noTrailingComment: Rule = defineRule({
  create(context) {
    return {
      "Program:exit"() {
        const { text } = context.sourceCode;
        for (const comment of context.sourceCode.getAllComments()) {
          if (comment.type !== "Line" || SAME_LINE_DIRECTIVE_REGEX.test(comment.value)) continue;
          const [start] = comment.range;
          const lineStart = text.lastIndexOf("\n", start - 1) + 1;
          const codeBefore = text.slice(lineStart, start).trim();
          // The formatter itself hangs a comment on a ternary branch after its `?` or `:`, so that is its own line
          if (codeBefore && !TERNARY_OPERATORS.has(codeBefore))
            context.report({ loc: comment.loc, message: TRAILING_COMMENT_MESSAGE });
        }
      },
    };
  },
  meta: { type: "suggestion" },
});
