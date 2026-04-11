import type { z } from "zod";

import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectSurveySchema } from "@esposter/db-schema";

export const updateSurveyInputSchema = refineAtLeastOne(
  selectSurveySchema.pick({ group: true, id: true, name: true }).partial({ group: true, name: true }),
  ["group", "name"],
);
export type UpdateSurveyInput = z.infer<typeof updateSurveyInputSchema>;
