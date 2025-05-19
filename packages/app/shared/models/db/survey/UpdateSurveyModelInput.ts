import type { z } from "zod";

import { selectSurveySchema } from "#shared/db/schema/surveys";

export const updateSurveyModelInputSchema = selectSurveySchema.pick({ id: true, model: true, modelVersion: true });
export type UpdateSurveyModelInput = z.infer<typeof updateSurveyModelInputSchema>;
