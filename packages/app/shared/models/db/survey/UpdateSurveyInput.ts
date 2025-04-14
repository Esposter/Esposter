import type { z } from "zod";

import { selectSurveySchema } from "#shared/db/schema/surveys";

export const updateSurveyInputSchema = selectSurveySchema
  .pick({ group: true, id: true, model: true, modelVersion: true, name: true })
  .partial({ group: true, model: true, name: true });
export type UpdateSurveyInput = z.infer<typeof updateSurveyInputSchema>;
