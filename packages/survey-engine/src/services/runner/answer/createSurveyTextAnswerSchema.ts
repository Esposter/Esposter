import type { SurveyTextNode } from "#src/models/SurveyTextNode";

import { SurveyTextInputType } from "#src/models/SurveyTextInputType";
import { createSurveyNumberAnswerSchema } from "#src/services/runner/answer/createSurveyNumberAnswerSchema";
import { createSurveyPatternAnswerSchema } from "#src/services/runner/answer/createSurveyPatternAnswerSchema";
import { createSurveyStringAnswerSchema } from "#src/services/runner/answer/createSurveyStringAnswerSchema";
import { createSurveyStringRangeAnswerSchema } from "#src/services/runner/answer/createSurveyStringRangeAnswerSchema";
import { parseSurveyNumberBound } from "#src/services/runner/answer/parseSurveyNumberBound";
import { SURVEY_INVALID_ANSWER_MESSAGE } from "#src/services/runner/constants";
import { exhaustiveGuard } from "@esposter/shared";
import { z } from "zod";

// A text question's answer, held to the input type it is typed with and the bounds and pattern its owner gave
export const createSurveyTextAnswerSchema = (node: SurveyTextNode): z.ZodType => {
  switch (node.props.inputType) {
    case SurveyTextInputType.Number:
      return createSurveyNumberAnswerSchema({
        max: parseSurveyNumberBound(node.props.max),
        min: parseSurveyNumberBound(node.props.min),
      });
    case SurveyTextInputType.Date:
    case SurveyTextInputType.DatetimeLocal:
    case SurveyTextInputType.Time:
      return createSurveyPatternAnswerSchema(
        createSurveyStringRangeAnswerSchema({ max: node.props.max, min: node.props.min }),
        node.props.pattern,
      );
    case SurveyTextInputType.Email:
      return createSurveyPatternAnswerSchema(z.email({ error: SURVEY_INVALID_ANSWER_MESSAGE }), node.props.pattern);
    case SurveyTextInputType.Url:
      return createSurveyPatternAnswerSchema(z.url({ error: SURVEY_INVALID_ANSWER_MESSAGE }), node.props.pattern);
    case SurveyTextInputType.Text:
    case SurveyTextInputType.Tel:
    case SurveyTextInputType.Password:
      return createSurveyPatternAnswerSchema(
        createSurveyStringAnswerSchema({ maxLength: node.props.maxLength, minLength: node.props.minLength }),
        node.props.pattern,
      );
    default:
      return exhaustiveGuard(node.props.inputType);
  }
};
