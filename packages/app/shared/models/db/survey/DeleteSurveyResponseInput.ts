import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { surveyResponseEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteSurveyResponseInputSchema = z.object({
  // The partition key is the survey id, derived from this owner-checked id — never accepted from the caller
  ...resourceIdInputSchema.shape,
  ...surveyResponseEntitySchema.pick({ rowKey: true }).shape,
});
export type DeleteSurveyResponseInput = z.infer<typeof deleteSurveyResponseInputSchema>;
