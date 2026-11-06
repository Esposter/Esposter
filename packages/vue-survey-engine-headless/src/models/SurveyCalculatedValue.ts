import { surveyExpressionSchema } from "#src/services/surveyExpressionSchema";
import { surveyNameSchema } from "#src/services/surveyNameSchema";
import { z } from "zod";

// A value a survey computes from its answers, referred to by its name in an expression, and written into the saved result when it is included
export interface SurveyCalculatedValue {
  expression: string;
  includeIntoResult: boolean;
  name: string;
}

export const surveyCalculatedValueSchema: z.ZodObject<{
  expression: typeof surveyExpressionSchema;
  includeIntoResult: z.ZodDefault<z.ZodBoolean>;
  name: typeof surveyNameSchema;
}> = z.object({
  expression: surveyExpressionSchema,
  includeIntoResult: z.boolean().default(false),
  name: surveyNameSchema,
}) satisfies z.ZodType<SurveyCalculatedValue>;
