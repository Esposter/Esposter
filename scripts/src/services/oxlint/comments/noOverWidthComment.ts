import type { Rule } from "@oxlint/plugins";

import { OVER_WIDTH_COMMENT_MESSAGE } from "#src/services/oxlint/comments/constants";
import { findOverWidthCommentLines } from "#src/services/oxlint/comments/findOverWidthCommentLines";
import { defineRule } from "@oxlint/plugins";

// The formatter wraps code at the print width and never a comment, so a comment line keeps it here. Every physical
// Line a comment fills is read, and a line the comment shares with code is that code's line, which the formatter
// Settles
export const noOverWidthComment: Rule = defineRule({
  create(context) {
    return {
      "Program:exit"() {
        const { text } = context.sourceCode;
        for (const comment of context.sourceCode.getAllComments()) {
          const [start, end] = comment.range;
          for (const { length, lineNumber } of findOverWidthCommentLines(text, start, end, comment.loc.start.line))
            context.report({
              loc: { end: { column: length, line: lineNumber }, start: { column: 0, line: lineNumber } },
              message: OVER_WIDTH_COMMENT_MESSAGE,
            });
        }
      },
    };
  },
  meta: { type: "suggestion" },
});
