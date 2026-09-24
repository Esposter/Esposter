export type ContentBlock =
  | DocumentBlock
  | ImageBlock
  | OtherBlock
  | TextBlock
  | ThinkingBlock
  | ToolResultBlock
  | ToolUseBlock;

// The blocks of an Anthropic message the console renders, read the same way whether a block arrived live on the
// SDK's stream or from a transcript on disk. Any other block still parses, into an "other" block carrying itself
// As JSON, so a block type this console has not met yet is shown raw rather than dropped.
// A PDF or a text file attached to a prompt
interface DocumentBlock {
  type: "document";
}

interface ImageBlock {
  type: "image";
}

interface OtherBlock {
  blockType: string;
  raw: string;
  type: "other";
}

interface TextBlock {
  text: string;
  type: "text";
}

interface ThinkingBlock {
  thinking: string;
  type: "thinking";
}

interface ToolResultBlock {
  content: string | { text?: string; type: string }[];
  is_error?: boolean;
  tool_use_id: string;
  type: "tool_result";
}

interface ToolUseBlock {
  id: string;
  input: Record<string, unknown>;
  name: string;
  type: "tool_use";
}
