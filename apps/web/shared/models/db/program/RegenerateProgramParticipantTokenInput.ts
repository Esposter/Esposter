import { selectProgramParticipantInResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";

// A participant is named by its key value, the identity the status blade lists it under, within its program
export const regenerateProgramParticipantTokenInputSchema = z.object({
  ...resourceIdInputSchema.shape,
  keyValue: selectProgramParticipantInResourceSchema.shape.keyValue,
});
export type RegenerateProgramParticipantTokenInput = z.infer<typeof regenerateProgramParticipantTokenInputSchema>;
