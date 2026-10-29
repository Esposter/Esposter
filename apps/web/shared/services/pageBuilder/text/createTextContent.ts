import type { JSONContent } from "@tiptap/core";

// One paragraph holding the text, or an empty one
export const createTextContent = (text = ""): JSONContent => ({
  content: [{ content: text ? [{ text, type: "text" }] : [], type: "paragraph" }],
  type: "doc",
});
