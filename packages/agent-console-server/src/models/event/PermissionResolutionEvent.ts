import type { PermissionBehavior } from "#src/models/command/PermissionBehavior";
import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";

import { permissionBehaviorSchema } from "#src/models/command/PermissionBehavior";
import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { z } from "zod";

export interface PermissionResolutionEvent extends BaseAgentEvent<AgentEventType.PermissionResolution> {
  behavior: PermissionBehavior;
  requestId: string;
}

export const permissionResolutionEventSchema: z.ZodObject<{
  behavior: typeof permissionBehaviorSchema;
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  requestId: z.ZodString;
  type: z.ZodLiteral<AgentEventType.PermissionResolution>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.PermissionResolution)).shape,
  behavior: permissionBehaviorSchema,
  requestId: z.string().min(1),
}) satisfies z.ZodType<PermissionResolutionEvent>;
