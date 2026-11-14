import type { z } from "zod";

import { participantTokenInputSchema } from "#shared/models/db/survey/ParticipantTokenInput";
import { selectSurveyResponseInResourceSchema } from "@esposter/db-schema";

export const readSurveyResponseInputSchema = selectSurveyResponseInResourceSchema
  .pick({ id: true, resourceId: true })
  .extend({ participantToken: participantTokenInputSchema });
export type ReadSurveyResponseInput = z.infer<typeof readSurveyResponseInputSchema>;
