import { surveyResponseModelSchema } from "#shared/models/db/survey/SurveyResponseModel";
import { surveyResponseEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const createSurveyResponseInputSchema = surveyResponseEntitySchema
  .pick({ model: true, pageNo: true, participantToken: true, partitionKey: true, rowKey: true })
  // Whether this save leaves the response in progress, false for the one that submits it. Absent is a submit, which is
  // What every save meant before drafts were marked, so a tab still running that bundle keeps its meaning
  .extend({ isDraft: z.boolean().default(false), model: surveyResponseModelSchema });
export type CreateSurveyResponseInput = z.infer<typeof createSurveyResponseInputSchema>;
