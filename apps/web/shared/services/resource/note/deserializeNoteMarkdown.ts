import type { JSONContent } from "@tiptap/core";

import { createParagraph } from "#shared/services/resource/note/deserialize/createParagraph";
import { mapBlockTokens } from "#shared/services/resource/note/deserialize/mapBlockTokens";
import { marked } from "marked";

// The note a Markdown file imports as. Its shape is what the kit can hold, which the caller checks against the note's
// Content schema before it replaces anything
export const deserializeNoteMarkdown = (markdown: string): JSONContent => {
  const blocks = mapBlockTokens(marked.lexer(markdown));
  return { content: blocks.length === 0 ? [createParagraph([])] : blocks, type: "doc" };
};
