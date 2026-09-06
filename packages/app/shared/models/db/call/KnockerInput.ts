import { z } from "zod";

export const knockerInputSchema = z.object({ callSessionId: z.string(), sessionId: z.string() });
export type KnockerInput = z.infer<typeof knockerInputSchema>;
