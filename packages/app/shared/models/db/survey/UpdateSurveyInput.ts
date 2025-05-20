import type { z } from "zod/v4";

import { selectSurveySchema } from "#shared/db/schema/surveys";

export const updateSurveyInputSchema = selectSurveySchema
  .pick({ id: true })
  // @TODO: oneOf([group, name])
  .extend(selectSurveySchema.pick({ group: true, name: true }).partial());
export type UpdateSurveyInput = z.infer<typeof updateSurveyInputSchema>;
