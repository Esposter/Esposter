import type { JSONContent } from "@tiptap/core";

import { noteDocumentSchema } from "#shared/models/resource/note/NoteDocument";
import { z } from "zod";

// The Tiptap/ProseMirror JSON document is the source of truth at rest — HTML is only generated at the render
// Boundary (see the Note View), so the stored shape is the open-ended recursive ProseMirror node tree.
export interface NoteResource {
  doc: JSONContent;
}

export const noteResourceSchema = z.object({ doc: noteDocumentSchema }) satisfies z.ZodType<NoteResource>;
