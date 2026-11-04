import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { z } from "zod";

// A choice a choice question offers: the value an answer holds, and the text a respondent reads for it
export interface SurveyChoice {
  text: string;
  value: number | string;
}

export const surveyChoiceSchema: z.ZodObject<{
  text: z.ZodDefault<z.ZodString>;
  value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
}> = z.object({
  text: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  value: z.union([z.string().max(MAX_SURVEY_TEXT_LENGTH), z.number()]),
}) satisfies z.ZodType<SurveyChoice>;
