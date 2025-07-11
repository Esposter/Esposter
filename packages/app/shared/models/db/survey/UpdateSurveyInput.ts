import type { z } from "zod";

import { selectSurveySchema } from "#shared/db/schema/surveys";

export const updateSurveyInputSchema = selectSurveySchema
  .pick({ group: true, id: true, name: true })
  .partial({ group: true, name: true })
  .refine(({ group, name }) => group !== undefined || name !== undefined);
export type UpdateSurveyInput = z.infer<typeof updateSurveyInputSchema>;
