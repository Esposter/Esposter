import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { Model } from "#src/models/event/Model";
import type { SlashCommand } from "#src/models/event/SlashCommand";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { modelSchema } from "#src/models/event/Model";
import { slashCommandSchema } from "#src/models/event/SlashCommand";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface CapabilitiesEvent extends BaseAgentEvent<AgentEventType.Capabilities> {
  commands: SlashCommand[];
  models: Model[];
}

export const capabilitiesEventSchema: z.ZodObject<{
  commands: z.ZodArray<typeof slashCommandSchema>;
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  models: z.ZodArray<typeof modelSchema>;
  type: z.ZodLiteral<AgentEventType.Capabilities>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.Capabilities)).shape,
  commands: createUniqueArraySchema(slashCommandSchema, "name"),
  models: createUniqueArraySchema(modelSchema, "value"),
}) satisfies z.ZodType<CapabilitiesEvent>;
