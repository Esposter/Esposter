import { surveyResponseModelSchema } from "#shared/models/db/survey/SurveyResponseModel";
import { surveyResponseEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateSurveyResponseInputSchema = surveyResponseEntitySchema
  .pick({ model: true, modelVersion: true, pageNo: true, participantToken: true, partitionKey: true, rowKey: true })
  // Whether this save leaves the response in progress, false for the one that submits it
  .extend({ isDraft: z.boolean(), model: surveyResponseModelSchema });
export type UpdateSurveyResponseInput = z.infer<typeof updateSurveyResponseInputSchema>;
