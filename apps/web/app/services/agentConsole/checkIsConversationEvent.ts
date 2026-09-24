import type { ConversationEvent } from "@/models/agentConsole/ConversationEvent";
import type { AgentEvent, AgentEventType } from "agent-console-server/contracts";

import { ConversationEventTypes } from "@/models/agentConsole/ConversationEventTypes";

export const checkIsConversationEvent = (event: AgentEvent): event is ConversationEvent =>
  (ConversationEventTypes as readonly AgentEventType[]).includes(event.type) &&
  !("parentToolUseId" in event && event.parentToolUseId);
