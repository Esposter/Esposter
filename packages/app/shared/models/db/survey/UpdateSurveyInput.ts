import type { z } from "zod";

import { selectSurveySchema } from "#shared/db/schema/surveys";

export const updateSurveyInputSchema = selectSurveySchema
  .pick({ id: true, modelVersion: true })
  .merge(selectSurveySchema.pick({ group: true, model: true, name: true }).partial());
export type UpdateSurveyInput = z.infer<typeof updateSurveyInputSchema>;
