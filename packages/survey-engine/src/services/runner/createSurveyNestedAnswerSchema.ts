import type { SurveyAnswerValue } from "#src/models/SurveyAnswerValue";

import { MAX_SURVEY_ANSWER_ENTRY_COUNT, MAX_SURVEY_ANSWER_LENGTH } from "#src/services/constants";
import { SURVEY_INVALID_ANSWER_MESSAGE } from "#src/services/runner/constants";
import { surveyAnswerScalarSchema } from "#src/services/runner/surveyAnswerScalarSchema";
import { createRecordSchema } from "@esposter/shared";
import { z } from "zod";

// A list or a record whose entries each hold the value beneath it, so one level of nesting is one call on the level below
export const createSurveyNestedAnswerSchema = (inner: z.ZodType<SurveyAnswerValue>): z.ZodType<SurveyAnswerValue> =>
  z.union(
    [
      surveyAnswerScalarSchema,
      z
        .array(inner, { error: SURVEY_INVALID_ANSWER_MESSAGE })
        .max(MAX_SURVEY_ANSWER_ENTRY_COUNT, { error: SURVEY_INVALID_ANSWER_MESSAGE }),
      createRecordSchema(z.string().max(MAX_SURVEY_ANSWER_LENGTH), inner, MAX_SURVEY_ANSWER_ENTRY_COUNT),
    ],
    { error: SURVEY_INVALID_ANSWER_MESSAGE },
  );
