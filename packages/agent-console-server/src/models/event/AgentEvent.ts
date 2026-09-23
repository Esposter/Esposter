import type { AssistantMessageEvent } from "#src/models/event/AssistantMessageEvent";
import type { CapabilitiesEvent } from "#src/models/event/CapabilitiesEvent";
import type { CommandOutputEvent } from "#src/models/event/CommandOutputEvent";
import type { CompactionEvent } from "#src/models/event/CompactionEvent";
import type { ContextUsageEvent } from "#src/models/event/ContextUsageEvent";
import type { HookEvent } from "#src/models/event/HookEvent";
import type { HostErrorEvent } from "#src/models/event/HostErrorEvent";
import type { PermissionRequestEvent } from "#src/models/event/PermissionRequestEvent";
import type { PermissionResolutionEvent } from "#src/models/event/PermissionResolutionEvent";
import type { RateLimitEvent } from "#src/models/event/RateLimitEvent";
import type { SessionInitEvent } from "#src/models/event/SessionInitEvent";
import type { SessionSettingsEvent } from "#src/models/event/SessionSettingsEvent";
import type { SessionStateEvent } from "#src/models/event/SessionStateEvent";
import type { SubagentEvent } from "#src/models/event/SubagentEvent";
import type { ThinkingEvent } from "#src/models/event/ThinkingEvent";
import type { TodoUpdateEvent } from "#src/models/event/TodoUpdateEvent";
import type { ToolProgressEvent } from "#src/models/event/ToolProgressEvent";
import type { ToolResultEvent } from "#src/models/event/ToolResultEvent";
import type { ToolUseEvent } from "#src/models/event/ToolUseEvent";
import type { TurnResultEvent } from "#src/models/event/TurnResultEvent";
import type { UnknownEvent } from "#src/models/event/UnknownEvent";
import type { UserMessageEvent } from "#src/models/event/UserMessageEvent";

import { assistantMessageEventSchema } from "#src/models/event/AssistantMessageEvent";
import { capabilitiesEventSchema } from "#src/models/event/CapabilitiesEvent";
import { commandOutputEventSchema } from "#src/models/event/CommandOutputEvent";
import { compactionEventSchema } from "#src/models/event/CompactionEvent";
import { contextUsageEventSchema } from "#src/models/event/ContextUsageEvent";
import { hookEventSchema } from "#src/models/event/HookEvent";
import { hostErrorEventSchema } from "#src/models/event/HostErrorEvent";
import { permissionRequestEventSchema } from "#src/models/event/PermissionRequestEvent";
import { permissionResolutionEventSchema } from "#src/models/event/PermissionResolutionEvent";
import { rateLimitEventSchema } from "#src/models/event/RateLimitEvent";
import { sessionInitEventSchema } from "#src/models/event/SessionInitEvent";
import { sessionSettingsEventSchema } from "#src/models/event/SessionSettingsEvent";
import { sessionStateEventSchema } from "#src/models/event/SessionStateEvent";
import { subagentEventSchema } from "#src/models/event/SubagentEvent";
import { thinkingEventSchema } from "#src/models/event/ThinkingEvent";
import { todoUpdateEventSchema } from "#src/models/event/TodoUpdateEvent";
import { toolProgressEventSchema } from "#src/models/event/ToolProgressEvent";
import { toolResultEventSchema } from "#src/models/event/ToolResultEvent";
import { toolUseEventSchema } from "#src/models/event/ToolUseEvent";
import { turnResultEventSchema } from "#src/models/event/TurnResultEvent";
import { unknownEventSchema } from "#src/models/event/UnknownEvent";
import { userMessageEventSchema } from "#src/models/event/UserMessageEvent";
import { z } from "zod";

export type AgentEvent =
  | AssistantMessageEvent
  | CapabilitiesEvent
  | CommandOutputEvent
  | CompactionEvent
  | ContextUsageEvent
  | HookEvent
  | HostErrorEvent
  | PermissionRequestEvent
  | PermissionResolutionEvent
  | RateLimitEvent
  | SessionInitEvent
  | SessionSettingsEvent
  | SessionStateEvent
  | SubagentEvent
  | ThinkingEvent
  | TodoUpdateEvent
  | ToolProgressEvent
  | ToolResultEvent
  | ToolUseEvent
  | TurnResultEvent
  | UnknownEvent
  | UserMessageEvent;

export const agentEventSchema: z.ZodDiscriminatedUnion<
  [
    typeof assistantMessageEventSchema,
    typeof capabilitiesEventSchema,
    typeof commandOutputEventSchema,
    typeof compactionEventSchema,
    typeof contextUsageEventSchema,
    typeof hookEventSchema,
    typeof hostErrorEventSchema,
    typeof permissionRequestEventSchema,
    typeof permissionResolutionEventSchema,
    typeof rateLimitEventSchema,
    typeof sessionInitEventSchema,
    typeof sessionSettingsEventSchema,
    typeof sessionStateEventSchema,
    typeof subagentEventSchema,
    typeof thinkingEventSchema,
    typeof todoUpdateEventSchema,
    typeof toolProgressEventSchema,
    typeof toolResultEventSchema,
    typeof toolUseEventSchema,
    typeof turnResultEventSchema,
    typeof unknownEventSchema,
    typeof userMessageEventSchema,
  ],
  "type"
> = z.discriminatedUnion("type", [
  assistantMessageEventSchema,
  capabilitiesEventSchema,
  commandOutputEventSchema,
  compactionEventSchema,
  contextUsageEventSchema,
  hookEventSchema,
  hostErrorEventSchema,
  permissionRequestEventSchema,
  permissionResolutionEventSchema,
  rateLimitEventSchema,
  sessionInitEventSchema,
  sessionSettingsEventSchema,
  sessionStateEventSchema,
  subagentEventSchema,
  thinkingEventSchema,
  todoUpdateEventSchema,
  toolProgressEventSchema,
  toolResultEventSchema,
  toolUseEventSchema,
  turnResultEventSchema,
  unknownEventSchema,
  userMessageEventSchema,
]) satisfies z.ZodType<AgentEvent>;
