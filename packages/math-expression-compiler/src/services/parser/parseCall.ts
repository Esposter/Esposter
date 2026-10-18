import type { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { PLACEHOLDER } from "#src/services/parser/constants";
import { failMathExpressionAt } from "#src/services/parser/failMathExpressionAt";
import { getMathExpressionSignatureError } from "#src/services/parser/getMathExpressionSignatureError";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";
import { parseArgument } from "#src/services/parser/parseArgument";
import { parseSequence } from "#src/services/parser/parseSequence";
import { getMathExpressionParameterType } from "#src/services/shared/getMathExpressionParameterType";
import { getMathExpressionSignatures } from "#src/services/shared/getMathExpressionSignatures";
import { matchMathExpressionSignature } from "#src/services/shared/matchMathExpressionSignature";

// Every error of a call is reported at the function's name, which the caller read before the call's parenthesis
export const parseCall = (
  state: MathExpressionParserState,
  name: string,
  column: number,
  parse: (state: MathExpressionParserState, rule: MathExpressionGrammarRule) => MathExpressionNode,
): MathExpressionNode => {
  const signatures = getMathExpressionSignatures(name);
  if (signatures === undefined) {
    failMathExpressionAt(state, `Unknown function "${name}"`, column);
    return PLACEHOLDER;
  }

  getMathExpressionToken(state);
  const argumentNodes = parseSequence(state, ")", (argument) => parseArgument(argument, parse));
  if (state.error !== null) return PLACEHOLDER;

  getMathExpressionToken(state);
  const parameterTypes = argumentNodes.map((argument) => getMathExpressionParameterType(argument));
  if (matchMathExpressionSignature(signatures, parameterTypes) === undefined) {
    failMathExpressionAt(state, getMathExpressionSignatureError(name, signatures, parameterTypes), column);
    return PLACEHOLDER;
  }
  return { arguments: argumentNodes, name, type: MathExpressionNodeType.Call };
};
