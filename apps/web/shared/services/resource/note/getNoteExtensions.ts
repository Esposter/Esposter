import type { AnyExtension } from "@tiptap/core";

import { NOTE_IMAGE_SOURCE_REGEX } from "#shared/services/resource/note/constants";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import { StarterKit } from "@tiptap/starter-kit";

// An image is read only from a resource asset url. A paste carries a web page's image with that page's own address, which
// The published view would drop, so the paste is refused here rather than kept as a picture the owner sees and no reader does
const NoteImage = Image.extend({
  parseHTML: () => [
    {
      getAttrs: (element) =>
        typeof element !== "string" && NOTE_IMAGE_SOURCE_REGEX.test(element.getAttribute("src") ?? "") ? {} : false,
      tag: "img[src]",
    },
  ],
});

// The single writing kit shared by the Note editor and its published render — StarterKit covers headings,
// Lists, bold/italic/code, blockquote, and links, and task lists sit beside its lists with a task able to hold
// Sub-tasks as a bullet holds sub-bullets. Both the editor and generateHTML must build their schema from the same
// Extension set, so the render matches what was authored; codeBlock stays on for documents
export const getNoteExtensions = (): AnyExtension[] => [
  StarterKit.configure({ link: { openOnClick: false } }),
  TableKit,
  TaskList,
  TaskItem.configure({ nested: true }),
  NoteImage,
];
