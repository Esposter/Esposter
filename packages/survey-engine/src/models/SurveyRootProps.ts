import type { SurveyCalculatedValue } from "#src/models/SurveyCalculatedValue";

import { surveyCalculatedValueSchema } from "#src/models/SurveyCalculatedValue";
import { SurveyProgressBarPlacement } from "#src/models/SurveyProgressBarPlacement";
import {
  MAX_SURVEY_CALCULATED_VALUE_COUNT,
  MAX_SURVEY_HTML_LENGTH,
  MAX_SURVEY_TEXT_LENGTH,
  MAX_SURVEY_URL_LENGTH,
} from "#src/services/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The props of a survey as a whole: its texts, logo and colours, how its pages show progress and numbering, and the values it calculates
export interface SurveyRootProps {
  accentColor?: string;
  backgroundColor?: string;
  calculatedValues: SurveyCalculatedValue[];
  completedHtml?: string;
  completeText?: string;
  description?: string;
  logo?: string;
  pageNextText?: string;
  pagePrevText?: string;
  showProgressBar: SurveyProgressBarPlacement;
  showQuestionNumbers: boolean;
  title?: string;
}

// Six hex digits after the hash, the form a colour input writes
const HEX_COLOR_REGEX = /^#[\da-f]{6}$/iu;

export const surveyRootPropsSchema: z.ZodObject<
  {
    accentColor: z.ZodOptional<z.ZodString>;
    backgroundColor: z.ZodOptional<z.ZodString>;
    calculatedValues: z.ZodDefault<z.ZodArray<typeof surveyCalculatedValueSchema>>;
    completedHtml: z.ZodOptional<z.ZodString>;
    completeText: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    pageNextText: z.ZodOptional<z.ZodString>;
    pagePrevText: z.ZodOptional<z.ZodString>;
    showProgressBar: z.ZodDefault<z.ZodEnum<typeof SurveyProgressBarPlacement>>;
    showQuestionNumbers: z.ZodDefault<z.ZodBoolean>;
    title: z.ZodOptional<z.ZodString>;
  },
  z.core.$strict
> = z.strictObject({
  accentColor: z.string().regex(HEX_COLOR_REGEX).optional(),
  backgroundColor: z.string().regex(HEX_COLOR_REGEX).optional(),
  calculatedValues: createUniqueArraySchema(surveyCalculatedValueSchema, "name")
    .max(MAX_SURVEY_CALCULATED_VALUE_COUNT)
    .default([]),
  completedHtml: z.string().max(MAX_SURVEY_HTML_LENGTH).optional(),
  completeText: z.string().max(MAX_SURVEY_TEXT_LENGTH).optional(),
  description: z.string().max(MAX_SURVEY_TEXT_LENGTH).optional(),
  logo: z.string().min(1).max(MAX_SURVEY_URL_LENGTH).optional(),
  pageNextText: z.string().max(MAX_SURVEY_TEXT_LENGTH).optional(),
  pagePrevText: z.string().max(MAX_SURVEY_TEXT_LENGTH).optional(),
  showProgressBar: z.enum(SurveyProgressBarPlacement).default(SurveyProgressBarPlacement.Off),
  showQuestionNumbers: z.boolean().default(false),
  title: z.string().max(MAX_SURVEY_TEXT_LENGTH).optional(),
}) satisfies z.ZodType<SurveyRootProps>;
