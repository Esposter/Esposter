import type { JSONContent } from "@tiptap/core";

import { serializeBlocks } from "@/services/resource/note/serialize/serializeBlocks";

// The Markdown file a note exports as, which deserializeNoteMarkdown reads back to the same document
export const serializeNoteMarkdown = (doc: JSONContent): string => {
  const markdown = serializeBlocks(doc.content ?? []);
  return markdown === "" ? "" : `${markdown}\n`;
};
