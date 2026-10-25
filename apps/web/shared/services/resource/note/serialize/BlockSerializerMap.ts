import type { NodesSerializer } from "#shared/models/resource/note/serialize/NodesSerializer";
import type { JSONContent } from "@tiptap/core";

import { prefixLines } from "#shared/services/resource/note/serialize/prefixLines";
import { serializeCodeBlock } from "#shared/services/resource/note/serialize/serializeCodeBlock";
import { serializeInline } from "#shared/services/resource/note/serialize/serializeInline";
import { serializeListItems } from "#shared/services/resource/note/serialize/serializeListItems";
import { serializeParagraph } from "#shared/services/resource/note/serialize/serializeParagraph";

// The writing kit's blocks as CommonMark's. A node with no form here keeps its text as a paragraph, so the reader's
// words survive the export even where the structure does not
export const BlockSerializerMap: Record<string, (node: JSONContent, serializeBlocks: NodesSerializer) => string> = {
  blockquote: (node, serializeBlocks) => prefixLines(serializeBlocks(node.content ?? []), "> ", "> "),
  bulletList: (node, serializeBlocks) => serializeListItems(node.content ?? [], () => "- ", serializeBlocks),
  codeBlock: serializeCodeBlock,
  heading: (node) => `${"#".repeat(Number(node.attrs?.level ?? 1))} ${serializeInline(node.content ?? [])}`,
  horizontalRule: () => "---",
  // An image is stored at the app's own address, which a file cannot carry, so the file keeps the words the image was given
  image: (node) => serializeParagraph({ content: [{ text: String(node.attrs?.alt ?? ""), type: "text" }] }),
  orderedList: (node, serializeBlocks) => {
    const start = Number(node.attrs?.start ?? 1);
    return serializeListItems(node.content ?? [], (_item, index) => `${start + index}. `, serializeBlocks);
  },
  paragraph: serializeParagraph,
  taskList: (node, serializeBlocks) =>
    serializeListItems(node.content ?? [], (item) => (item.attrs?.checked ? "- [x] " : "- [ ] "), serializeBlocks),
};
