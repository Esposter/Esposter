import type { MathExpressionParse } from "#src/models/parser/MathExpressionParse";
import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { parseList } from "#src/services/parser/parseList";

// A call's argument is a list or an assignment
export const parseArgument = (state: MathExpressionParserState, parse: MathExpressionParse): MathExpressionNode =>
  checkIsToken(state, "[") ? parseList(state, parse) : parse(state, MathExpressionGrammarRule.Assignment);
