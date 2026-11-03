import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionParse } from "#src/models/SurveyExpressionParse";
import type { SurveyExpressionParserState } from "#src/models/SurveyExpressionParserState";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { Result } from "neverthrow";

import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { SurveyExpressionPrefixOperatorMap } from "#src/services/SurveyExpressionPrefixOperatorMap";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { takeOne } from "@esposter/shared";
import { err } from "neverthrow";

// Takes the prefix operator at the cursor and the operand it applies to. A symbol that no prefix operator spells is not
// The start of an expression, so it is refused where an operand is expected
export const parsePrefixOperator = (
  state: SurveyExpressionParserState,
  parse: SurveyExpressionParse,
): Result<SurveyExpressionNode, SurveyLogicError> => {
  const token = takeOne(state.tokens, state.index);
  const prefix = getOwnValue(SurveyExpressionPrefixOperatorMap, token.text);
  if (prefix === undefined) return err({ message: "Expected an expression", position: token.position });

  state.index++;
  return parse(state, prefix.power).map((operand): SurveyExpressionNode => ({
    operand,
    operator: prefix.operator,
    position: token.position,
    type: SurveyExpressionNodeType.Unary,
  }));
};
