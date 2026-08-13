import type { JSONContent } from "@tiptap/core";

import { z } from "zod";

// The Tiptap/ProseMirror JSON document is the source of truth at rest — HTML is only generated at the render
// Boundary (see the Note View), so the stored shape is the open-ended recursive ProseMirror node tree.
export interface NoteResource {
  doc: JSONContent;
}
// A ProseMirror node: type + optional attrs/marks/text and recursive children. looseObject keeps any extra
// Node fields a future Tiptap extension emits, so a valid document never fails the content-schema parse.
const jsonContentSchema: z.ZodType<JSONContent> = z.lazy(() =>
  z.looseObject({
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(jsonContentSchema).optional(),
    marks: z.array(z.looseObject({ attrs: z.record(z.string(), z.unknown()).optional(), type: z.string() })).optional(),
    text: z.string().optional(),
    type: z.string().optional(),
  }),
);
// A fresh Note is an empty document with a single paragraph — the shape Tiptap starts an editor with
export const EMPTY_NOTE_DOC: JSONContent = { content: [{ type: "paragraph" }], type: "doc" };

export const noteResourceSchema = z.object({
  doc: jsonContentSchema,
}) satisfies z.ZodType<NoteResource>;
