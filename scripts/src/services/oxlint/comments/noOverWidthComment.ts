import type { Rule } from "@oxlint/plugins";

import { OVER_WIDTH_COMMENT_MESSAGE } from "#src/services/oxlint/comments/constants";
import { PRINT_WIDTH } from "@esposter/configuration/oxfmt";
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
          let lineNumber = comment.loc.start.line;
          for (let lineStart = text.lastIndexOf("\n", start - 1) + 1; lineStart <= end; lineNumber++) {
            const newline = text.indexOf("\n", lineStart);
            const lineEnd = newline === -1 ? text.length : newline;
            const line = text.slice(lineStart, lineEnd);
            const codeBefore = lineStart < start ? text.slice(lineStart, start) : "";
            const codeAfter = lineEnd > end ? text.slice(end, lineEnd) : "";
            if (codeBefore.trim() === "" && codeAfter.trim() === "" && line.length > PRINT_WIDTH)
              context.report({
                loc: { end: { column: line.length, line: lineNumber }, start: { column: 0, line: lineNumber } },
                message: OVER_WIDTH_COMMENT_MESSAGE,
              });
            lineStart = lineEnd + 1;
          }
        }
      },
    };
  },
  meta: { type: "suggestion" },
});
