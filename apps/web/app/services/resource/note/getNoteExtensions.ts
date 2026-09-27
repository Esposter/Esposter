import type { AnyExtension } from "@tiptap/vue-3";

import { TaskItem, TaskList } from "@tiptap/extension-list";
import { StarterKit } from "@tiptap/starter-kit";

// The single writing kit shared by the Note editor and its published render — StarterKit covers headings,
// Lists, bold/italic/code, blockquote, and links, and task lists sit beside its lists with a task able to hold
// Sub-tasks as a bullet holds sub-bullets. Both the editor and generateHTML must build their schema from the same
// Extension set, so the render matches what was authored; codeBlock stays on for documents.
export const getNoteExtensions = (): AnyExtension[] => [
  StarterKit.configure({ link: { openOnClick: false } }),
  TaskList,
  TaskItem.configure({ nested: true }),
];
