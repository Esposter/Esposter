import type { JSONContent } from "@tiptap/core";

import { toMergeField } from "@/services/emailEditor/toMergeField";

// A text's rich text with a merge field's token after its last words, in the last paragraph, set off by a space when the
// Words do not already end in one. A text with no paragraph gets one holding the token, so a drop always lands in the text it was dropped on
export const appendMergeFieldToText = (text: JSONContent, columnName: string): JSONContent => {
  const paragraphs = text.content ?? [];
  const lastParagraph = paragraphs.at(-1);
  if (!lastParagraph)
    return { ...text, content: [{ content: [{ text: toMergeField(columnName), type: "text" }], type: "paragraph" }] };

  const lastRun = lastParagraph.content?.at(-1);
  const isAfterWords = lastRun?.text !== undefined && !/\s$/u.test(lastRun.text);
  const token = { text: `${isAfterWords ? " " : ""}${toMergeField(columnName)}`, type: "text" };
  return {
    ...text,
    content: [...paragraphs.slice(0, -1), { ...lastParagraph, content: [...(lastParagraph.content ?? []), token] }],
  };
};
