import type { JSONContent } from "@tiptap/core";

import { toMergeField } from "@/services/emailEditor/toMergeField";

// A text's rich text with a merge field's token after its last words, in the last paragraph. A text with no paragraph
// Gets one holding the token, so a drop always lands in the text it was dropped on
export const appendMergeFieldToText = (text: JSONContent, columnName: string): JSONContent => {
  const token = { text: toMergeField(columnName), type: "text" };
  const paragraphs = text.content ?? [];
  const lastParagraph = paragraphs.at(-1);
  if (!lastParagraph) return { ...text, content: [{ content: [token], type: "paragraph" }] };

  return {
    ...text,
    content: [...paragraphs.slice(0, -1), { ...lastParagraph, content: [...(lastParagraph.content ?? []), token] }],
  };
};
