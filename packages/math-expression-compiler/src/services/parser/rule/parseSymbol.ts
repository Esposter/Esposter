import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { checkIsNameToken } from "#src/services/parser/checkIsNameToken";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { computeNumberLiteral } from "#src/services/parser/computeNumberLiteral";
import { PLACEHOLDER } from "#src/services/parser/constants";
import { failMathExpression } from "#src/services/parser/failMathExpression";
import { getMathExpressionColumn } from "#src/services/parser/getMathExpressionColumn";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";
import { parseCall } from "#src/services/parser/parseCall";

// A number, a name, a call or a parenthesised group, the tightest operand of a formula
export const parseSymbol: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  if (state.tokenType === MathExpressionTokenType.Number) {
    const value = computeNumberLiteral(state.token);
    if (value === null) {
      failMathExpression(state, `String "${state.token.split("i")[0]}" is out of range`);
      getMathExpressionToken(state);
      return PLACEHOLDER;
    }

    getMathExpressionToken(state);
    return { type: MathExpressionNodeType.Number, value };
  }

  if (checkIsNameToken(state)) {
    const name = state.token;
    const column = getMathExpressionColumn(state);
    const isSymbol = state.tokenType === MathExpressionTokenType.Symbol;
    getMathExpressionToken(state);
    if (checkIsToken(state, "(")) return parseCall(state, name, column, parse);
    if (isSymbol) return { name, type: MathExpressionNodeType.Name };
  }

  if (checkIsToken(state, "(")) {
    getMathExpressionToken(state);
    const operand = parse(state, MathExpressionGrammarRule.Assignment);
    if (state.error === null && !checkIsToken(state, ")")) failMathExpression(state, "Parenthesis ) expected");
    if (state.error !== null) return PLACEHOLDER;

    getMathExpressionToken(state);
    return { operand, type: MathExpressionNodeType.Group };
  }

  failMathExpression(state, checkIsToken(state, "") ? "Unexpected end of expression" : "Value expected");
  return PLACEHOLDER;
};
