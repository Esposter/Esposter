import type { z } from "zod";

import { selectSurveySchema } from "#shared/db/schema/surveys";

export const updateSurveyInputSchema = selectSurveySchema
  .pick({ id: true, modelVersion: true })
  .merge(selectSurveySchema.partial().pick({ group: true, model: true, name: true }));
export type UpdateSurveyInput = z.infer<typeof updateSurveyInputSchema>;
