import { createSurveyBooleanAnswerSchema } from "#src/services/runner/answer/createSurveyBooleanAnswerSchema";
import { createSurveyNumberAnswerSchema } from "#src/services/runner/answer/createSurveyNumberAnswerSchema";
import { createSurveyStringAnswerSchema } from "#src/services/runner/answer/createSurveyStringAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE } from "#src/services/runner/constants";
import { z } from "zod";

// A value an answer holds on its own, beside the lists and records that nest it: text, a number or a yes or no
export const surveyAnswerScalarSchema: z.ZodType<boolean | number | string> = z.union(
  [createSurveyStringAnswerSchema({}), createSurveyNumberAnswerSchema({}), createSurveyBooleanAnswerSchema()],
  { error: SURVEY_INVALID_ANSWER_MESSAGE },
);
