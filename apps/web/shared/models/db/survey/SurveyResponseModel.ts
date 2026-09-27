import { MAX_SURVEY_QUESTION_NAME_LENGTH } from "#shared/services/survey/constants";
import { AZURE_MAX_STRING_PROPERTY_LENGTH } from "@esposter/azure";
import { z } from "zod";

// A respondent's answers, as either response write takes them. The model is stored as one JSON string property, so
// It is bounded by what that property holds: the one anonymous write path in the platform otherwise takes whatever
// A request body carries, and the Table rejects it only after the write is attempted
export const surveyResponseModelSchema = z
  .record(z.string().min(1).max(MAX_SURVEY_QUESTION_NAME_LENGTH), z.unknown())
  .refine((model) => JSON.stringify(model).length <= AZURE_MAX_STRING_PROPERTY_LENGTH, {
    error: `answers must serialize to at most ${AZURE_MAX_STRING_PROPERTY_LENGTH} characters`,
  }) satisfies z.ZodType<Record<string, unknown>>;
