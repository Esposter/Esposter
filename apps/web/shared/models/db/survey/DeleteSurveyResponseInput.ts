import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { selectSurveyResponseInResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const deleteSurveyResponseInputSchema = z.object({
  // The survey id is the owner-checked id, never accepted from the caller on its own
  ...resourceIdInputSchema.shape,
  responseId: selectSurveyResponseInResourceSchema.shape.id,
});
export type DeleteSurveyResponseInput = z.infer<typeof deleteSurveyResponseInputSchema>;
