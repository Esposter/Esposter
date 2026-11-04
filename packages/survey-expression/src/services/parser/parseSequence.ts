import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionParse } from "#src/models/SurveyExpressionParse";
import type { SurveyExpressionParserState } from "#src/models/SurveyExpressionParserState";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { Result } from "neverthrow";

import { checkIsPunctuation } from "#src/services/parser/checkIsPunctuation";
import { parseSequenceItems } from "#src/services/parser/parseSequenceItems";
import { takeOne } from "@esposter/shared";
import { ok } from "neverthrow";

// Parses comma-separated items up to the closing punctuation, which is taken with them. Nothing before the closing
// Punctuation is an empty sequence, so a comma with nothing after it is an error rather than an empty item
export const parseSequence = (
  state: SurveyExpressionParserState,
  closing: string,
  message: string,
  parse: SurveyExpressionParse,
): Result<SurveyExpressionNode[], SurveyLogicError> => {
  if (checkIsPunctuation(takeOne(state.tokens, state.index), closing)) {
    state.index++;
    return ok([]);
  }
  return parseSequenceItems(state, closing, message, parse, []);
};
