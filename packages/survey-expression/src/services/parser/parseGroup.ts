import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionParse } from "#src/models/SurveyExpressionParse";
import type { SurveyExpressionParserState } from "#src/models/SurveyExpressionParserState";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { Result } from "neverthrow";

import { LOWEST_POWER } from "#src/services/constants";
import { checkIsPunctuation } from "#src/services/parser/checkIsPunctuation";
import { takeOne } from "@esposter/shared";
import { err, ok } from "neverthrow";

// Parses the expression inside a pair of parentheses. The group leaves no node of its own, so the expression keeps the
// Position of its first token and the parentheses only decide the grouping
export const parseGroup = (
  state: SurveyExpressionParserState,
  parse: SurveyExpressionParse,
): Result<SurveyExpressionNode, SurveyLogicError> => {
  state.index++;
  return parse(state, LOWEST_POWER).andThen((node) => {
    const token = takeOne(state.tokens, state.index);
    if (checkIsPunctuation(token, ")")) {
      state.index++;
      return ok(node);
    }
    return err({ message: "Expected ) to close the parenthesis opened here", position: token.position });
  });
};
