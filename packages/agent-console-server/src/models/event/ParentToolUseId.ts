import { z } from "zod";

// The Task tool call a subagent's event belongs to, empty for the main agent — the lane the event is drawn in
export interface ParentToolUseId {
  parentToolUseId: string;
}

export const parentToolUseIdSchema: z.ZodObject<{ parentToolUseId: z.ZodString }> = z.object({
  parentToolUseId: z.string(),
}) satisfies z.ZodType<ParentToolUseId>;
