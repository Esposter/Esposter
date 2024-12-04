import type { z } from "zod";

import { selectSurveySchema } from "#shared/db/schema/surveys";

export const createSurveyInputSchema = selectSurveySchema.pick({ group: true, model: true, name: true });
export type CreateSurveyInput = z.infer<typeof createSurveyInputSchema>;
