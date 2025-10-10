import type { z } from "zod";

import { selectSurveySchema } from "@esposter/db-schema";

export const deleteSurveyInputSchema = selectSurveySchema.shape.id;
export type DeleteSurveyInput = z.infer<typeof deleteSurveyInputSchema>;
