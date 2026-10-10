import { z } from "zod";

// A start takes the lease under the session the page generated once, and sends with every attempt of its start, so a
// Retry of a start whose write landed finds the lease it took
export interface StartGenshinInput {
  sessionId: string;
}

export const startGenshinInputSchema = z.object({ sessionId: z.uuid() }) satisfies z.ZodType<StartGenshinInput>;
