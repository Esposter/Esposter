import { selectResourceSchema, surveyResponseEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteSurveyResponseInputSchema = z.object({
  ...surveyResponseEntitySchema.pick({ rowKey: true }).shape,
  // The partition key is the survey id, derived from this owner-checked id — never accepted from the caller
  id: selectResourceSchema.shape.id,
});
export type DeleteSurveyResponseInput = z.infer<typeof deleteSurveyResponseInputSchema>;
