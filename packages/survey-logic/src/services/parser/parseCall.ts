import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionParse } from "#src/models/SurveyExpressionParse";
import type { SurveyExpressionParserState } from "#src/models/SurveyExpressionParserState";
import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { Result } from "neverthrow";

import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { checkIsPunctuation } from "#src/services/parser/checkIsPunctuation";
import { parseSequence } from "#src/services/parser/parseSequence";
import { takeOne } from "@esposter/shared";
import { err } from "neverthrow";

// Parses a name followed by its arguments in parentheses. The name is taken as written, since whether a function of
// That name exists is decided after the parse
export const parseCall = (
  state: SurveyExpressionParserState,
  parse: SurveyExpressionParse,
): Result<SurveyExpressionNode, SurveyLogicError> => {
  const name = takeOne(state.tokens, state.index);
  state.index++;
  const opening = takeOne(state.tokens, state.index);
  const message = `Expected ( after ${name.text}`;
  if (!checkIsPunctuation(opening, "(")) return err({ message, position: opening.position });

  state.index++;
  return parseSequence(state, ")", "Expected , or ) to close the call opened here", parse).map(
    (args): SurveyExpressionNode => ({
      args,
      name: name.text,
      position: name.position,
      type: SurveyExpressionNodeType.Call,
    }),
  );
};
