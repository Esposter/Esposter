import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionParserState } from "#src/models/SurveyExpressionParserState";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { Result } from "neverthrow";

import { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";
import { LOWEST_POWER, MAX_SURVEY_EXPRESSION_LENGTH } from "#src/services/constants";
import { parseBinary } from "#src/services/parser/parseBinary";
import { tokenizeSurveyExpression } from "#src/services/tokenizeSurveyExpression";
import { takeOne } from "@esposter/shared";
import { err, ok } from "neverthrow";

// Parses the whole source into its tree, or returns the first fault it meets. A source past the length limit is refused at
// Its first character past the limit, before it is read. A complete expression followed by more tokens is a fault, so a
// Stray token is never silently dropped
export const parseSurveyExpression = (source: string): Result<SurveyExpressionNode, SurveyLogicError> => {
  if (source.length > MAX_SURVEY_EXPRESSION_LENGTH)
    return err({ message: "The expression is too long", position: MAX_SURVEY_EXPRESSION_LENGTH });

  return tokenizeSurveyExpression(source).andThen((tokens) => {
    const state: SurveyExpressionParserState = { index: 0, tokens };
    return parseBinary(state, LOWEST_POWER).andThen((node) => {
      const token = takeOne(tokens, state.index);
      return token.type === SurveyExpressionTokenType.End
        ? ok(node)
        : err({ message: "Expected the end of the expression", position: token.position });
    });
  });
};
