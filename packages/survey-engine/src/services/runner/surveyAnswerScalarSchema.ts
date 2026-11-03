import { MAX_SURVEY_ANSWER_LENGTH } from "#src/services/constants";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_TOO_LONG_MESSAGE } from "#src/services/runner/constants";
import { z } from "zod";

// A value an answer holds on its own, beside the lists and records that nest it: text, a number or a yes or no
export const surveyAnswerScalarSchema: z.ZodType<boolean | number | string> = z.union(
  [
    z
      .string({ error: SURVEY_INVALID_ANSWER_MESSAGE })
      .max(MAX_SURVEY_ANSWER_LENGTH, { error: SURVEY_TOO_LONG_MESSAGE }),
    z.number({ error: SURVEY_INVALID_ANSWER_MESSAGE }),
    z.boolean({ error: SURVEY_INVALID_ANSWER_MESSAGE }),
  ],
  { error: SURVEY_INVALID_ANSWER_MESSAGE },
);
