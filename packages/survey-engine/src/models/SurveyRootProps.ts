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
  accentColor: string;
  backgroundColor: string;
  calculatedValues: SurveyCalculatedValue[];
  completedHtml: string;
  completeText: string;
  description: string;
  logo: string;
  pageNextText: string;
  pagePrevText: string;
  showProgressBar: SurveyProgressBarPlacement;
  showQuestionNumbers: boolean;
  title: string;
}

// Six hex digits after the hash, the form a colour input writes, or nothing when the survey sets no colour
const HEX_COLOR_REGEX = /^(?:#[\da-f]{6})?$/iu;

export const surveyRootPropsSchema: z.ZodObject<
  {
    accentColor: z.ZodDefault<z.ZodString>;
    backgroundColor: z.ZodDefault<z.ZodString>;
    calculatedValues: z.ZodDefault<z.ZodArray<typeof surveyCalculatedValueSchema>>;
    completedHtml: z.ZodDefault<z.ZodString>;
    completeText: z.ZodDefault<z.ZodString>;
    description: z.ZodDefault<z.ZodString>;
    logo: z.ZodDefault<z.ZodString>;
    pageNextText: z.ZodDefault<z.ZodString>;
    pagePrevText: z.ZodDefault<z.ZodString>;
    showProgressBar: z.ZodDefault<z.ZodEnum<typeof SurveyProgressBarPlacement>>;
    showQuestionNumbers: z.ZodDefault<z.ZodBoolean>;
    title: z.ZodDefault<z.ZodString>;
  },
  z.core.$strict
> = z.strictObject({
  accentColor: z.string().regex(HEX_COLOR_REGEX).default(""),
  backgroundColor: z.string().regex(HEX_COLOR_REGEX).default(""),
  calculatedValues: createUniqueArraySchema(surveyCalculatedValueSchema, "name")
    .max(MAX_SURVEY_CALCULATED_VALUE_COUNT)
    .default([]),
  completedHtml: z.string().max(MAX_SURVEY_HTML_LENGTH).default(""),
  completeText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  description: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  logo: z.string().max(MAX_SURVEY_URL_LENGTH).default(""),
  pageNextText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  pagePrevText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  showProgressBar: z.enum(SurveyProgressBarPlacement).default(SurveyProgressBarPlacement.Off),
  showQuestionNumbers: z.boolean().default(false),
  title: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
}) satisfies z.ZodType<SurveyRootProps>;
