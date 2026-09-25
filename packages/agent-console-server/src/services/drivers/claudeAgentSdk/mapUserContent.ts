import type { ContentBlock } from "#src/models/claudeAgentSdk/ContentBlock";
import type { MessageContext } from "#src/models/claudeAgentSdk/MessageContext";
import type { AgentEvent } from "#src/models/event/AgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { getEventId } from "#src/services/drivers/claudeAgentSdk/getEventId";
import { toToolResultText } from "#src/services/drivers/claudeAgentSdk/toToolResultText";
import { toUnknownEvent } from "#src/services/drivers/claudeAgentSdk/toUnknownEvent";
import { exhaustiveGuard } from "@esposter/shared";

// A user message is either what was typed — text and attached files, shown as one message — or the results of the
// Tool calls the previous assistant message made, each drawn against its call on the timeline
export const mapUserContent = (content: ContentBlock[] | string, context: MessageContext): AgentEvent[] => {
  if (typeof content === "string")
    return [
      { ...context, attachmentCount: 0, id: context.messageUuid, text: content, type: AgentEventType.UserMessage },
    ];

  const events: AgentEvent[] = [];
  const texts: string[] = [];
  let attachmentCount = 0;

  for (const [index, block] of content.entries()) {
    const id = getEventId(context.messageUuid, index);
    switch (block.type) {
      case "document":
      case "image":
        attachmentCount++;
        break;
      case "other":
        events.push(toUnknownEvent(id, block.blockType, block.raw, context.createdAt));
        break;
      case "text":
        texts.push(block.text);
        break;
      // A user message carries neither of these; one that does is shown raw rather than dropped
      case "thinking":
      case "tool_use":
        events.push(toUnknownEvent(id, block.type, JSON.stringify(block), context.createdAt));
        break;
      case "tool_result":
        events.push({
          content: toToolResultText(block.content),
          createdAt: context.createdAt,
          id,
          isError: Boolean(block.is_error),
          parentToolUseId: context.parentToolUseId,
          toolUseId: block.tool_use_id,
          type: AgentEventType.ToolResult,
        });
        break;
      default:
        exhaustiveGuard(block);
    }
  }

  return texts.length > 0 || attachmentCount > 0
    ? [
        {
          ...context,
          attachmentCount,
          id: context.messageUuid,
          text: texts.join("\n\n"),
          type: AgentEventType.UserMessage,
        },
        ...events,
      ]
    : events;
};
