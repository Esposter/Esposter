import { participantTokenInputSchema } from "#shared/models/db/survey/ParticipantTokenInput";
import { surveyResponseModelSchema } from "#shared/models/db/survey/SurveyResponseModel";
import { selectSurveyResponseInResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateSurveyResponseInputSchema = selectSurveyResponseInResourceSchema
  .pick({ id: true, modelVersion: true, pageNo: true, resourceId: true })
  // Whether this save leaves the response in progress, false for the one that submits it
  .extend({ isDraft: z.boolean(), model: surveyResponseModelSchema, participantToken: participantTokenInputSchema });
export type UpdateSurveyResponseInput = z.infer<typeof updateSurveyResponseInputSchema>;
