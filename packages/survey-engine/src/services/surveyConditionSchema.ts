import { MAX_SURVEY_EXPRESSION_LENGTH } from "survey-logic";
import { z } from "zod";

// A condition that shows, enables or requires a node, where an empty one holds always, so a node with none carries the empty string
export const surveyConditionSchema: z.ZodDefault<z.ZodString> = z
  .string()
  .max(MAX_SURVEY_EXPRESSION_LENGTH)
  .default("");
