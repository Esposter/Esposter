import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionParserState } from "#src/models/SurveyExpressionParserState";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { Result } from "neverthrow";

import { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";
import { LOWEST_POWER } from "#src/services/constants";
import { parseBinary } from "#src/services/parser/parseBinary";
import { tokenizeSurveyExpression } from "#src/services/tokenizeSurveyExpression";
import { takeOne } from "@esposter/shared";
import { err, ok } from "neverthrow";

// Parses the whole source into its tree, or returns the first fault it meets. A complete expression followed by more
// Tokens is a fault, so a stray token is never silently dropped
export const parseSurveyExpression = (source: string): Result<SurveyExpressionNode, SurveyLogicError> =>
  tokenizeSurveyExpression(source).andThen((tokens) => {
    const state: SurveyExpressionParserState = { index: 0, tokens };
    return parseBinary(state, LOWEST_POWER).andThen((node) => {
      const token = takeOne(tokens, state.index);
      return token.type === SurveyExpressionTokenType.End
        ? ok(node)
        : err({ message: "Expected the end of the expression", position: token.position });
    });
  });
