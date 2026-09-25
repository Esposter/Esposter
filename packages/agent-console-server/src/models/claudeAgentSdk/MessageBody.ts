import type { ContentBlock } from "#src/models/claudeAgentSdk/ContentBlock";

// What an assistant message and a user message share: the content the console renders. A plain string is a user
// Prompt as it was typed
export interface MessageBody {
  content: ContentBlock[] | string;
}
