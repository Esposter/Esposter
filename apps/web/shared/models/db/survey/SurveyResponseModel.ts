import type { SurveyAnswers } from "vue-survey-engine-headless";

import { MAX_SURVEY_ANSWERS_LENGTH } from "#shared/services/survey/constants";
import { createRecordSchema } from "@esposter/shared";
import {
  MAX_SURVEY_QUESTION_COUNT,
  MAX_SURVEY_QUESTION_NAME_LENGTH,
  surveyAnswerValueSchema,
} from "vue-survey-engine-headless";
import { z } from "zod";

// A respondent's answers, as either response write takes them. Each answer is one the survey's answer types can hold, and
// the whole record is bounded in size: the one anonymous write path in the platform otherwise takes whatever a request
// body carries
export const surveyResponseModelSchema = createRecordSchema(
  z.string().min(1).max(MAX_SURVEY_QUESTION_NAME_LENGTH),
  surveyAnswerValueSchema,
  MAX_SURVEY_QUESTION_COUNT,
).refine((model) => JSON.stringify(model).length <= MAX_SURVEY_ANSWERS_LENGTH, {
  error: `answers must serialize to at most ${MAX_SURVEY_ANSWERS_LENGTH} characters`,
}) satisfies z.ZodType<SurveyAnswers>;
