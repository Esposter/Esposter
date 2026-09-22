import type { Rule } from "@oxlint/plugins";

import { checkIsContinuation } from "#src/services/oxlint/comments/checkIsContinuation";
import {
  CODE_SHAPED_REGEX,
  FUNCTION_PREFIX_REGEX,
  MESSAGE,
  OPENING_CAPITALISED_WORD_REGEX,
} from "#src/services/oxlint/comments/constants";
import { defineRule } from "@oxlint/plugins";

export const noCapitalizedIdentifier: Rule = defineRule({
  create(context) {
    const identifierNames = new Set<string>();
    return {
      Identifier(node) {
        identifierNames.add(node.name);
      },
      "Program:exit"() {
        const comments = context.sourceCode.getAllComments();
        for (const [index, comment] of comments.entries()) {
          const word = OPENING_CAPITALISED_WORD_REGEX.exec(comment.value)?.groups?.word;
          if (comment.type !== "Line" || word === undefined || identifierNames.has(word)) continue;

          const name = `${word.charAt(0).toLowerCase()}${word.slice(1)}`;
          if (
            FUNCTION_PREFIX_REGEX.test(name) ||
            (checkIsContinuation(comments[index - 1], comment) &&
              CODE_SHAPED_REGEX.test(name) &&
              identifierNames.has(name))
          )
            context.report({ loc: comment.loc, message: MESSAGE });
        }
      },
    };
  },
  meta: { type: "suggestion" },
});
