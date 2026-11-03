import type { SurveyValidator } from "#src/models/SurveyValidator";
import type { BlockNodeProps } from "headless-block-editor";

import { surveyValidatorSchema } from "#src/models/SurveyValidator";
import { MAX_SURVEY_TEXT_LENGTH, MAX_SURVEY_VALIDATOR_COUNT } from "#src/services/constants";
import { surveyExpressionSchema } from "#src/services/surveyExpressionSchema";
import { surveyNameSchema } from "#src/services/surveyNameSchema";
import { z } from "zod";

// The props every question holds besides its id, which the node schema adds last, so each kind's own schema spreads the shape below
export interface SurveyQuestionBaseProps extends BlockNodeProps {
  description?: string;
  enableIf?: string;
  isRequired: boolean;
  name: string;
  requiredErrorText?: string;
  requiredIf?: string;
  title?: string;
  validators: SurveyValidator[];
  visibleIf?: string;
}

// The question fields without the id, which a kind's schema spreads and the node schema completes
export const surveyQuestionBasePropsShape: {
  description: z.ZodOptional<z.ZodString>;
  enableIf: z.ZodOptional<typeof surveyExpressionSchema>;
  isRequired: z.ZodDefault<z.ZodBoolean>;
  name: typeof surveyNameSchema;
  requiredErrorText: z.ZodOptional<z.ZodString>;
  requiredIf: z.ZodOptional<typeof surveyExpressionSchema>;
  title: z.ZodOptional<z.ZodString>;
  validators: z.ZodDefault<z.ZodArray<typeof surveyValidatorSchema>>;
  visibleIf: z.ZodOptional<typeof surveyExpressionSchema>;
} = {
  description: z.string().max(MAX_SURVEY_TEXT_LENGTH).optional(),
  enableIf: surveyExpressionSchema.optional(),
  isRequired: z.boolean().default(false),
  name: surveyNameSchema,
  requiredErrorText: z.string().max(MAX_SURVEY_TEXT_LENGTH).optional(),
  requiredIf: surveyExpressionSchema.optional(),
  title: z.string().max(MAX_SURVEY_TEXT_LENGTH).optional(),
  // A validator names no field and is its own check, so a repeat of one is kept rather than refused as a duplicate
  validators: z.array(surveyValidatorSchema).max(MAX_SURVEY_VALIDATOR_COUNT).default([]),
  visibleIf: surveyExpressionSchema.optional(),
};
