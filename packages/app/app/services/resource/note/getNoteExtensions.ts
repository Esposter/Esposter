import type { AnyExtension } from "@tiptap/vue-3";

import { StarterKit } from "@tiptap/starter-kit";

// The single writing kit shared by the Note editor and its published render — StarterKit covers headings,
// Lists, bold/italic/code, blockquote, and links. Both the editor and generateHTML must build their schema
// From the same extension set, so the render matches what was authored; codeBlock stays on for documents.
export const getNoteExtensions = (): AnyExtension[] => [StarterKit.configure({ link: { openOnClick: false } })];
