import type { SurveyAnswers } from "vue-survey-engine-headless";

import { AZURE_MAX_STRING_PROPERTY_LENGTH } from "@esposter/azure";
import { createRecordSchema } from "@esposter/shared";
import {
  MAX_SURVEY_QUESTION_COUNT,
  MAX_SURVEY_QUESTION_NAME_LENGTH,
  surveyAnswerValueSchema,
} from "vue-survey-engine-headless";
import { z } from "zod";

// A respondent's answers, as either response write takes them. Each answer is one the survey's answer types can hold, and the
// Whole record is bounded by what its one stored JSON string property holds: the one anonymous write path in the platform
// Otherwise takes whatever a request body carries, and the Table rejects it only after the write is attempted
export const surveyResponseModelSchema = createRecordSchema(
  z.string().min(1).max(MAX_SURVEY_QUESTION_NAME_LENGTH),
  surveyAnswerValueSchema,
  MAX_SURVEY_QUESTION_COUNT,
).refine((model) => JSON.stringify(model).length <= AZURE_MAX_STRING_PROPERTY_LENGTH, {
  error: `answers must serialize to at most ${AZURE_MAX_STRING_PROPERTY_LENGTH} characters`,
}) satisfies z.ZodType<SurveyAnswers>;
