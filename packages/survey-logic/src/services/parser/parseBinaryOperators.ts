import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionParse } from "#src/models/SurveyExpressionParse";
import type { SurveyExpressionParserState } from "#src/models/SurveyExpressionParserState";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { Result } from "neverthrow";

import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";
import { SurveyExpressionBinaryOperatorMap } from "#src/services/SurveyExpressionBinaryOperatorMap";
import { SurveyExpressionPostfixOperatorMap } from "#src/services/SurveyExpressionPostfixOperatorMap";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { takeOne } from "@esposter/shared";
import { ok } from "neverthrow";

// Takes each operator at the cursor that binds at least as tightly as the minimum power, with its right operand, so
// `a - b - c` and `a ^ b ^ c` both group to the left. A postfix operator has no right operand to take
export const parseBinaryOperators = (
  state: SurveyExpressionParserState,
  left: SurveyExpressionNode,
  minimumPower: number,
  parse: SurveyExpressionParse,
): Result<SurveyExpressionNode, SurveyLogicError> => {
  const token = takeOne(state.tokens, state.index);
  if (token.type !== SurveyExpressionTokenType.Operator) return ok(left);

  const postfix = getOwnValue(SurveyExpressionPostfixOperatorMap, token.text);
  if (postfix !== undefined && postfix.power >= minimumPower) {
    state.index++;
    const unary: SurveyExpressionNode = {
      operand: left,
      operator: postfix.operator,
      position: token.position,
      type: SurveyExpressionNodeType.Unary,
    };
    return parseBinaryOperators(state, unary, minimumPower, parse);
  }

  const binary = getOwnValue(SurveyExpressionBinaryOperatorMap, token.text);
  if (binary === undefined || binary.power < minimumPower) return ok(left);

  state.index++;
  return parse(state, binary.power + 1).andThen((right) => {
    const node: SurveyExpressionNode = {
      left,
      operator: binary.operator,
      position: token.position,
      right,
      type: SurveyExpressionNodeType.Binary,
    };
    return parseBinaryOperators(state, node, minimumPower, parse);
  });
};
