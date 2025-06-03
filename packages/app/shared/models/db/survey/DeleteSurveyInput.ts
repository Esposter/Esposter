import type { z } from "zod/v4";

import { selectSurveySchema } from "#shared/db/schema/surveys";

export const deleteSurveyInputSchema = selectSurveySchema.shape.id;
export type DeleteSurveyInput = z.infer<typeof deleteSurveyInputSchema>;
