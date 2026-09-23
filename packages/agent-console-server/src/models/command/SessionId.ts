import { z } from "zod";

export interface SessionId {
  sessionId: string;
}

export const sessionIdSchema: z.ZodObject<{ sessionId: z.ZodString }> = z.object({
  sessionId: z.string().min(1),
}) satisfies z.ZodType<SessionId>;
