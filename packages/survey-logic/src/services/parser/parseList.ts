import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionParse } from "#src/models/SurveyExpressionParse";
import type { SurveyExpressionParserState } from "#src/models/SurveyExpressionParserState";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { Result } from "neverthrow";

import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { parseSequence } from "#src/services/parser/parseSequence";
import { takeOne } from "@esposter/shared";

// Parses a bracketed list of expressions, separated by commas
export const parseList = (
  state: SurveyExpressionParserState,
  parse: SurveyExpressionParse,
): Result<SurveyExpressionNode, SurveyLogicError> => {
  const opening = takeOne(state.tokens, state.index);
  state.index++;
  return parseSequence(state, "]", "Expected , or ] to close the list opened here", parse).map(
    (items): SurveyExpressionNode => ({ items, position: opening.position, type: SurveyExpressionNodeType.List }),
  );
};
