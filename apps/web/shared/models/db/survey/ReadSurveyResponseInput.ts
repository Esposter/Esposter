import type { z } from "zod";

import { surveyResponseEntitySchema } from "@esposter/db-schema";

export const readSurveyResponseInputSchema = surveyResponseEntitySchema.pick({
  participantToken: true,
  partitionKey: true,
  rowKey: true,
});
export type ReadSurveyResponseInput = z.infer<typeof readSurveyResponseInputSchema>;
