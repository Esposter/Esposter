import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { z } from "zod";
// A piece of the main agent's reply or thinking as the model writes it. The whole block still arrives as its own
// Event once written, and replaces every piece of it
export interface StreamDeltaEvent extends BaseAgentEvent<AgentEventType.StreamDelta> {
  // The block the piece belongs to, so the page tells where one block's run ends and the next begins
  blockId: string;
  isThinking: boolean;
  text: string;
}

export const streamDeltaEventSchema: z.ZodObject<{
  blockId: z.ZodString;
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  isThinking: z.ZodBoolean;
  text: z.ZodString;
  type: z.ZodLiteral<AgentEventType.StreamDelta>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.StreamDelta)).shape,
  blockId: z.string().min(1),
  isThinking: z.boolean(),
  text: z.string(),
}) satisfies z.ZodType<StreamDeltaEvent>;
