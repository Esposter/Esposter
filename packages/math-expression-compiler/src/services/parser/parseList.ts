import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { PLACEHOLDER } from "#src/services/parser/constants";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";
import { parseSequence } from "#src/services/parser/parseSequence";

// A list is a call's argument alone, and holds numbers only, so a list inside it is refused as any other value is
export const parseList = (
  state: MathExpressionParserState,
  parse: (state: MathExpressionParserState, rule: MathExpressionGrammarRule) => MathExpressionNode,
): MathExpressionNode => {
  getMathExpressionToken(state);
  const elements = parseSequence(state, "]", (item) => parse(item, MathExpressionGrammarRule.Assignment));
  if (state.error !== null) return PLACEHOLDER;

  getMathExpressionToken(state);
  return { elements, type: MathExpressionNodeType.List };
};
