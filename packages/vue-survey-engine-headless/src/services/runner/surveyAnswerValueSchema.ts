import type { SurveyAnswerValue } from "#src/models/SurveyAnswerValue";
import type { z } from "zod";

import { createSurveyNestedAnswerSchema } from "#src/services/runner/createSurveyNestedAnswerSchema";
import { surveyAnswerScalarSchema } from "#src/services/runner/surveyAnswerScalarSchema";

// An answer's lists and records nest three levels deep at most, so the value is built out three times over the scalar and stops there
// A schema that recursed without a limit would accept a nesting no question can produce
const surveyAnswerLevel1Schema = createSurveyNestedAnswerSchema(surveyAnswerScalarSchema);
const surveyAnswerLevel2Schema = createSurveyNestedAnswerSchema(surveyAnswerLevel1Schema);

export const surveyAnswerValueSchema: z.ZodType<SurveyAnswerValue> =
  createSurveyNestedAnswerSchema(surveyAnswerLevel2Schema);
