import { callParticipantSchema, callSessionIdSchema } from "@esposter/db-schema";
import { z } from "zod";

// The knocker is addressed by the id the lobby holds it under, the one its knock was named by
export const knockerInputSchema = z.object({ ...callSessionIdSchema.shape, knockerId: callParticipantSchema.shape.id });
export type KnockerInput = z.infer<typeof knockerInputSchema>;
