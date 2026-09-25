import type { ContentBlock } from "#src/models/claudeAgentSdk/ContentBlock";

// A tool result is a string or a list of parts; the console shows the text, and a part with none as its type
export const toToolResultText = (content: Extract<ContentBlock, { type: "tool_result" }>["content"]): string =>
  typeof content === "string"
    ? content
    : content.map((part) => (part.text === undefined ? `[${part.type}]` : part.text)).join("\n");
