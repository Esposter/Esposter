import { MAX_SURVEY_QUESTION_NAME_LENGTH } from "#src/services/constants";
import { z } from "zod";

// A name a question, column or calculated value is referred to by in an expression, which reads a brace as the edge of a reference
export const surveyNameSchema: z.ZodString = z
  .string()
  .max(MAX_SURVEY_QUESTION_NAME_LENGTH)
  .regex(/^[^{}]+$/u);
