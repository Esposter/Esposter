import { callSessionIdSchema } from "@esposter/db-schema";
import { z } from "zod";

// The knocker is addressed by their session id, which is the participant id every call surface already holds
export const knockerInputSchema = z.object({ ...callSessionIdSchema.shape, sessionId: z.string() });
export type KnockerInput = z.infer<typeof knockerInputSchema>;
