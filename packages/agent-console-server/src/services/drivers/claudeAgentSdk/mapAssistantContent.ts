import type { ContentBlock } from "#src/models/claudeAgentSdk/ContentBlock";
import type { MessageContext } from "#src/models/claudeAgentSdk/MessageContext";
import type { AgentEvent } from "#src/models/event/AgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { getEventId } from "#src/services/drivers/claudeAgentSdk/getEventId";
import { toUnknownEvent } from "#src/services/drivers/claudeAgentSdk/toUnknownEvent";
import { exhaustiveGuard } from "@esposter/shared";

export const mapAssistantContent = (content: ContentBlock[], context: MessageContext): AgentEvent[] =>
  content.map((block, index): AgentEvent => {
    const id = getEventId(context.messageUuid, index);
    switch (block.type) {
      // An assistant message carries neither of these; one that does is shown raw rather than dropped
      case "document":
      case "image":
      case "tool_result":
        return toUnknownEvent(id, block.type, JSON.stringify(block), context.createdAt);
      case "other":
        return toUnknownEvent(id, block.blockType, block.raw, context.createdAt);
      case "text":
        return { ...context, id, text: block.text, type: AgentEventType.AssistantMessage };
      case "thinking":
        return { ...context, id, thinking: block.thinking, type: AgentEventType.Thinking };
      case "tool_use":
        return {
          ...context,
          id,
          input: block.input,
          name: block.name,
          toolUseId: block.id,
          type: AgentEventType.ToolUse,
        };
      default:
        return exhaustiveGuard(block);
    }
  });
