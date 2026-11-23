import type { Rule } from "@oxlint/plugins";

import {
  DIRECTIVE_REASON_MESSAGE,
  DIRECTIVE_REASON_REGEX,
  DIRECTIVE_REGEX,
} from "#src/services/oxlint/comments/constants";
import { defineRule } from "@oxlint/plugins";

export const requireDirectiveReason: Rule = defineRule({
  create(context) {
    return {
      "Program:exit"() {
        for (const comment of context.sourceCode.getAllComments())
          if (DIRECTIVE_REGEX.test(comment.value) && !DIRECTIVE_REASON_REGEX.test(comment.value))
            context.report({ loc: comment.loc, message: DIRECTIVE_REASON_MESSAGE });
      },
    };
  },
  meta: { type: "suggestion" },
});
