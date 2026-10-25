import type { AnyExtension } from "@tiptap/core";

import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import { StarterKit } from "@tiptap/starter-kit";

// The single writing kit shared by the Note editor and its published render — StarterKit covers headings,
// Lists, bold/italic/code, blockquote, and links, and task lists sit beside its lists with a task able to hold
// Sub-tasks as a bullet holds sub-bullets. Both the editor and generateHTML must build their schema from the same
// Extension set, so the render matches what was authored; codeBlock stays on for documents. An image's src is the
// Stable asset url its upload returns, never inline data, so the Image node keeps base64 sources off
export const getNoteExtensions = (): AnyExtension[] => [
  StarterKit.configure({ link: { openOnClick: false } }),
  TableKit,
  TaskList,
  TaskItem.configure({ nested: true }),
  Image.configure({ allowBase64: false }),
];
