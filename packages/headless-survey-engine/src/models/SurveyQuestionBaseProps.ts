import type { SurveyValidator } from "#src/models/SurveyValidator";
import type { BlockNodeProps } from "headless-block-editor";

import { surveyValidatorSchema } from "#src/models/SurveyValidator";
import { MAX_SURVEY_TEXT_LENGTH, MAX_SURVEY_VALIDATOR_COUNT } from "#src/services/constants";
import { surveyConditionSchema } from "#src/services/surveyConditionSchema";
import { surveyNameSchema } from "#src/services/surveyNameSchema";
import { z } from "zod";

// The props every question holds besides its id, which the node schema adds last, so each kind's own schema spreads the shape below
export interface SurveyQuestionBaseProps extends BlockNodeProps {
  description: string;
  enableIf: string;
  isRequired: boolean;
  name: string;
  requiredErrorText: string;
  requiredIf: string;
  title: string;
  validators: SurveyValidator[];
  visibleIf: string;
}

// The question fields without the id, which a kind's schema spreads and the node schema completes
export const surveyQuestionBasePropsShape: {
  description: z.ZodDefault<z.ZodString>;
  enableIf: typeof surveyConditionSchema;
  isRequired: z.ZodDefault<z.ZodBoolean>;
  name: typeof surveyNameSchema;
  requiredErrorText: z.ZodDefault<z.ZodString>;
  requiredIf: typeof surveyConditionSchema;
  title: z.ZodDefault<z.ZodString>;
  validators: z.ZodDefault<z.ZodArray<typeof surveyValidatorSchema>>;
  visibleIf: typeof surveyConditionSchema;
} = {
  description: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  enableIf: surveyConditionSchema,
  isRequired: z.boolean().default(false),
  name: surveyNameSchema,
  requiredErrorText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  requiredIf: surveyConditionSchema,
  title: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  // A validator names no field and is its own check, so a repeat of one is kept rather than refused as a duplicate
  validators: z.array(surveyValidatorSchema).max(MAX_SURVEY_VALIDATOR_COUNT).default([]),
  visibleIf: surveyConditionSchema,
};
