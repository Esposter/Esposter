import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionParse } from "#src/models/SurveyExpressionParse";
import type { SurveyExpressionParserState } from "#src/models/SurveyExpressionParserState";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { Result } from "neverthrow";

import { LOWEST_POWER } from "#src/services/constants";
import { checkIsPunctuation } from "#src/services/parser/checkIsPunctuation";
import { takeOne } from "@esposter/shared";
import { err, ok } from "neverthrow";

// Parses one item, then either a comma and the next item, or the closing punctuation that ends the sequence. The items
// Collect into one array as the recursion goes, so a long sequence is not copied at every item
export const parseSequenceItems = (
  state: SurveyExpressionParserState,
  closing: string,
  message: string,
  parse: SurveyExpressionParse,
  items: SurveyExpressionNode[],
): Result<SurveyExpressionNode[], SurveyLogicError> =>
  parse(state, LOWEST_POWER).andThen((item) => {
    items.push(item);
    const token = takeOne(state.tokens, state.index);
    if (checkIsPunctuation(token, ",")) {
      state.index++;
      return parseSequenceItems(state, closing, message, parse, items);
    }
    if (checkIsPunctuation(token, closing)) {
      state.index++;
      return ok(items);
    }
    return err({ message, position: token.position });
  });
