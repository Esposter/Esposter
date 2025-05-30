import { selectSurveySchema } from "#shared/db/schema/surveys";
import { z } from "zod/v4";

export const updateSurveyInputSchema = z.object({
  ...selectSurveySchema.pick({ id: true }).shape,
  // @TODO: oneOf([group, name])
  ...selectSurveySchema.partial({ group: true, name: true }).shape,
});
export type UpdateSurveyInput = z.infer<typeof updateSurveyInputSchema>;
