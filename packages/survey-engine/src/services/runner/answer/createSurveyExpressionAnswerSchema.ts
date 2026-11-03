import type { z } from "zod";

import { surveyAnswerScalarSchema } from "#src/services/runner/surveyAnswerScalarSchema";

// A calculated value's answer: the result of its expression, which is text, a number or a yes or no
export const createSurveyExpressionAnswerSchema = (): z.ZodType => surveyAnswerScalarSchema;
