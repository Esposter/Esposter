import { callSessionIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const setMutedInputSchema = z.object({ ...callSessionIdSchema.shape, isMuted: z.boolean() });
export type SetMutedInput = z.infer<typeof setMutedInputSchema>;
