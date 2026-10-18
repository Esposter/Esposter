import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { checkIsNameToken } from "#src/services/parser/checkIsNameToken";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { MathExpressionOperatorMap } from "#src/services/parser/MathExpressionOperatorMap";
import { getOwnValue } from "#src/services/shared/getOwnValue";

// Whether the token can begin a unary operand: a number, a name, a parenthesis or a prefix operator of the unary rule
// The first token the rules beneath it take
export const checkIsUnaryStart = (state: MathExpressionParserState): boolean =>
  state.tokenType === MathExpressionTokenType.Number ||
  checkIsNameToken(state) ||
  checkIsToken(state, "(") ||
  getOwnValue(MathExpressionOperatorMap[MathExpressionGrammarRule.Unary], state.token) !== undefined;
