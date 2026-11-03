import { MAX_SURVEY_EXPRESSION_LENGTH } from "#src/services/constants";
import { z } from "zod";

// An expression is never empty: a field that has none omits it, since an empty string is not an expression the parser reads
export const surveyExpressionSchema: z.ZodString = z.string().min(1).max(MAX_SURVEY_EXPRESSION_LENGTH);
