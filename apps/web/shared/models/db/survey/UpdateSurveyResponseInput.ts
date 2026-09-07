import type { z } from "zod";

import { surveyResponseEntitySchema } from "@esposter/db-schema";

export const updateSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  model: true,
  modelVersion: true,
  pageNo: true,
  participantToken: true,
  partitionKey: true,
  rowKey: true,
});
export type UpdateSurveyResponseInput = z.infer<typeof updateSurveyResponseInputSchema>;
