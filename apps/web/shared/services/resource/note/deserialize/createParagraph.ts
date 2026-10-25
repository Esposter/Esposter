import type { JSONContent } from "@tiptap/core";

import { mergeTextNodes } from "#shared/services/resource/note/deserialize/mergeTextNodes";

export const createParagraph = (content: JSONContent[]): JSONContent =>
  content.length === 0 ? { type: "paragraph" } : { content: mergeTextNodes(content), type: "paragraph" };
