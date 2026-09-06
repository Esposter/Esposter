import type { z } from "zod";

import { surveyResponseEntitySchema } from "@esposter/db-schema";

export const createSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  model: true,
  pageNo: true,
  participantToken: true,
  partitionKey: true,
  rowKey: true,
});
export type CreateSurveyResponseInput = z.infer<typeof createSurveyResponseInputSchema>;
