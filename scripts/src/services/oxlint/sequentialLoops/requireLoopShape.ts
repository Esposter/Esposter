import type { Rule } from "@oxlint/plugins";

import { DIRECTIVE_REGEX, REASON_CLAUSE_SEPARATOR } from "#src/services/oxlint/comments/constants";
import {
  LOOP_SHAPE_MESSAGE,
  NO_AWAIT_IN_LOOP_REGEX,
  REASON_SEPARATOR,
  SEQUENTIAL_LOOP_SHAPES,
} from "#src/services/oxlint/sequentialLoops/constants";
import { defineRule } from "@oxlint/plugins";

// Reports a `no-await-in-loop` directive whose reason does not open each clause with a named shape. A directive with
// No reason at all is `comments/require-directive-reason`'s, so it is left to that report
export const requireLoopShape: Rule = defineRule({
  create(context) {
    return {
      "Program:exit"() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (!DIRECTIVE_REGEX.test(comment.value)) continue;
          const separatorIndex = comment.value.indexOf(REASON_SEPARATOR);
          if (separatorIndex === -1 || !NO_AWAIT_IN_LOOP_REGEX.test(comment.value.slice(0, separatorIndex))) continue;
          const clauses = comment.value
            .slice(separatorIndex + REASON_SEPARATOR.length)
            .trim()
            .split(REASON_CLAUSE_SEPARATOR);
          if (!clauses.every((clause) => SEQUENTIAL_LOOP_SHAPES.some((shape) => clause.startsWith(`${shape}: `))))
            context.report({ loc: comment.loc, message: LOOP_SHAPE_MESSAGE });
        }
      },
    };
  },
  meta: { type: "suggestion" },
});
