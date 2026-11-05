import type { MathExpressionBinaryOperator } from "#src/models/parser/MathExpressionBinaryOperator";
import type { MathExpressionParse } from "#src/models/parser/MathExpressionParse";
import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionBinaryOperatorSymbol } from "#src/models/parser/MathExpressionBinaryOperatorSymbol";
import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { checkIsFactorStart } from "#src/services/parser/checkIsFactorStart";
import { createBinaryOperation } from "#src/services/parser/createBinaryOperation";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";
import { MathExpressionBinaryOperatorMap } from "#src/services/parser/MathExpressionBinaryOperatorMap";
import { getOwnValue } from "#src/services/shared/getOwnValue";

// Parses the binary operators of at least the minimum power by precedence climbing: an operand is followed by each operator
// That binds at least that tightly, and its right operand is parsed one power above it, so `a - b - c` is `(a - b) - c`.
// An implicit product is the same operator as `*`, taken where a factor begins with no operator between the operands. The
// Right operand calls this function again, not another rule, so an operator costs one call whatever its level
export const parseBinaryOperators = (
  state: MathExpressionParserState,
  parse: MathExpressionParse,
  minimumPower: number,
): MathExpressionNode => {
  let node = parse(state, MathExpressionGrammarRule.Percentage);
  let last = node;
  while (state.error === null) {
    const isImplicit = checkIsFactorStart(state, last);
    const operator = isImplicit
      ? MathExpressionBinaryOperatorMap[MathExpressionBinaryOperatorSymbol.Multiply]
      : getOwnValue<MathExpressionBinaryOperator>(MathExpressionBinaryOperatorMap, state.token);
    if (operator === undefined || operator.power < minimumPower) break;

    if (!isImplicit) getMathExpressionToken(state);
    last = parseBinaryOperators(state, parse, operator.power + 1);
    node = createBinaryOperation(node, operator, last);
  }
  return node;
};
