import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { surveyExpressionSchema } from "#src/services/surveyExpressionSchema";
import { z } from "zod";

// A check on a question's answer: the expression it is checked by, and the text shown when the check fails
export interface SurveyValidator {
  expression: string;
  text: string;
}

export const surveyValidatorSchema: z.ZodObject<{ expression: typeof surveyExpressionSchema; text: z.ZodString }> =
  z.object({
    expression: surveyExpressionSchema,
    text: z.string().min(1).max(MAX_SURVEY_TEXT_LENGTH),
  }) satisfies z.ZodType<SurveyValidator>;
