import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { z } from "zod";

export interface PermissionRequestEvent extends BaseAgentEvent<AgentEventType.PermissionRequest> {
  blockedPath: string;
  decisionReason: string;
  // Whether the SDK offered rules that stop this prompt recurring, which is what always-allow applies
  hasSuggestions: boolean;
  input: Record<string, unknown>;
  requestId: string;
  title: string;
  toolName: string;
  toolUseId: string;
}

export const permissionRequestEventSchema: z.ZodObject<{
  blockedPath: z.ZodString;
  createdAt: z.ZodCoercedDate;
  decisionReason: z.ZodString;
  hasSuggestions: z.ZodBoolean;
  id: z.ZodString;
  input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
  requestId: z.ZodString;
  title: z.ZodString;
  toolName: z.ZodString;
  toolUseId: z.ZodString;
  type: z.ZodLiteral<AgentEventType.PermissionRequest>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.PermissionRequest)).shape,
  blockedPath: z.string(),
  decisionReason: z.string(),
  hasSuggestions: z.boolean(),
  input: z.record(z.string(), z.unknown()),
  requestId: z.string().min(1),
  title: z.string(),
  toolName: z.string().min(1),
  toolUseId: z.string(),
}) satisfies z.ZodType<PermissionRequestEvent>;
