import type { z } from "zod";

import { surveyResponseModelSchema } from "#shared/models/db/survey/SurveyResponseModel";
import { surveyResponseEntitySchema } from "@esposter/db-schema";

export const createSurveyResponseInputSchema = surveyResponseEntitySchema
  .pick({ model: true, pageNo: true, participantToken: true, partitionKey: true, rowKey: true })
  .extend({ model: surveyResponseModelSchema });
export type CreateSurveyResponseInput = z.infer<typeof createSurveyResponseInputSchema>;
