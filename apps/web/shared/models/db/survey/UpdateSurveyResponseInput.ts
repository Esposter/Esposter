import type { z } from "zod";

import { surveyResponseModelSchema } from "#shared/models/db/survey/SurveyResponseModel";
import { surveyResponseEntitySchema } from "@esposter/db-schema";

export const updateSurveyResponseInputSchema = surveyResponseEntitySchema
  .pick({ model: true, modelVersion: true, pageNo: true, participantToken: true, partitionKey: true, rowKey: true })
  .extend({ model: surveyResponseModelSchema });
export type UpdateSurveyResponseInput = z.infer<typeof updateSurveyResponseInputSchema>;
