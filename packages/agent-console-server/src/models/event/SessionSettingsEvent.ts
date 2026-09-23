import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { PermissionMode } from "#src/models/session/PermissionMode";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { permissionModeSchema } from "#src/models/session/PermissionMode";
import { z } from "zod";

export interface SessionSettingsEvent extends BaseAgentEvent<AgentEventType.SessionSettings> {
  model: string;
  permissionMode: PermissionMode;
}

export const sessionSettingsEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  model: z.ZodString;
  permissionMode: typeof permissionModeSchema;
  type: z.ZodLiteral<AgentEventType.SessionSettings>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.SessionSettings)).shape,
  model: z.string(),
  permissionMode: permissionModeSchema,
}) satisfies z.ZodType<SessionSettingsEvent>;
