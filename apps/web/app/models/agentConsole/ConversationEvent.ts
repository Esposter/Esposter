import type { ConversationEventTypes } from "@/models/agentConsole/ConversationEventTypes";
import type { AgentEvent } from "agent-console-server/contracts";

export type ConversationEvent = Extract<AgentEvent, { type: (typeof ConversationEventTypes)[number] }>;
