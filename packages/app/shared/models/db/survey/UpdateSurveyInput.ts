import type { z } from "zod/v4";

import { selectSurveySchema } from "#shared/db/schema/surveys";

export const updateSurveyInputSchema = selectSurveySchema
  .pick({ group: true, id: true, name: true })
  .partial({ group: true, name: true })
  .refine(({ group, name }) => Boolean(group) || Boolean(name));
export type UpdateSurveyInput = z.infer<typeof updateSurveyInputSchema>;
