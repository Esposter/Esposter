import { MAX_SURVEY_QUESTION_NAME_LENGTH } from "#shared/services/survey/constants";
import { surveyResponseEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateSurveyResponseInputSchema = surveyResponseEntitySchema
  .pick({
    model: true,
    modelVersion: true,
    pageNo: true,
    participantToken: true,
    partitionKey: true,
    rowKey: true,
  })
  .extend({
    model: z.record(z.string().min(1).max(MAX_SURVEY_QUESTION_NAME_LENGTH), z.unknown()),
  });
export type UpdateSurveyResponseInput = z.infer<typeof updateSurveyResponseInputSchema>;
