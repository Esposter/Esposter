import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionParse } from "#src/models/SurveyExpressionParse";
import type { SurveyExpressionParserState } from "#src/models/SurveyExpressionParserState";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { Result } from "neverthrow";

import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";
import { checkIsPunctuation } from "#src/services/parser/checkIsPunctuation";
import { parseCall } from "#src/services/parser/parseCall";
import { parseGroup } from "#src/services/parser/parseGroup";
import { parseList } from "#src/services/parser/parseList";
import { parsePrefixOperator } from "#src/services/parser/parsePrefixOperator";
import { exhaustiveGuard, takeOne } from "@esposter/shared";
import { err, ok } from "neverthrow";

// Parses the operand at the cursor: a literal, a reference, a call, a list, a parenthesised expression or a prefix
// Operator with its operand. Any other token cannot start an expression
export const parseOperand = (
  state: SurveyExpressionParserState,
  parse: SurveyExpressionParse,
): Result<SurveyExpressionNode, SurveyLogicError> => {
  const token = takeOne(state.tokens, state.index);
  switch (token.type) {
    case SurveyExpressionTokenType.Boolean:
      state.index++;
      return ok({ position: token.position, type: SurveyExpressionNodeType.Literal, value: token.text === "true" });
    case SurveyExpressionTokenType.Identifier:
      return parseCall(state, parse);
    case SurveyExpressionTokenType.Number:
      state.index++;
      return ok({ position: token.position, type: SurveyExpressionNodeType.Literal, value: Number(token.text) });
    case SurveyExpressionTokenType.Operator:
      return parsePrefixOperator(state, parse);
    case SurveyExpressionTokenType.Punctuation:
      if (checkIsPunctuation(token, "(")) return parseGroup(state, parse);
      if (checkIsPunctuation(token, "[")) return parseList(state, parse);
      break;
    case SurveyExpressionTokenType.Reference:
      state.index++;
      return ok({ name: token.text, position: token.position, type: SurveyExpressionNodeType.Reference });
    case SurveyExpressionTokenType.String:
      state.index++;
      return ok({ position: token.position, type: SurveyExpressionNodeType.Literal, value: token.text });
    case SurveyExpressionTokenType.End:
      break;
    default:
      return exhaustiveGuard(token.type);
  }
  return err({ message: "Expected an expression", position: token.position });
};
