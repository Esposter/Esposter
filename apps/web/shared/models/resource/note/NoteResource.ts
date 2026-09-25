import type { JSONContent } from "@tiptap/core";

import { MAX_RESOURCE_CONTENT_LENGTH } from "#shared/services/resource/constants";
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
    attrs: z.record(z.string().max(MAX_RESOURCE_CONTENT_LENGTH), z.unknown()).optional(),
    content: z.array(jsonContentSchema).max(MAX_RESOURCE_CONTENT_LENGTH).optional(),
    marks: z
      .array(
        z.looseObject({
          attrs: z.record(z.string().max(MAX_RESOURCE_CONTENT_LENGTH), z.unknown()).optional(),
          type: z.string().max(MAX_RESOURCE_CONTENT_LENGTH),
        }),
      )
      .max(MAX_RESOURCE_CONTENT_LENGTH)
      .optional(),
    text: z.string().max(MAX_RESOURCE_CONTENT_LENGTH).optional(),
    type: z.string().max(MAX_RESOURCE_CONTENT_LENGTH).optional(),
  }),
);

export const noteResourceSchema = z.object({
  doc: jsonContentSchema,
}) satisfies z.ZodType<NoteResource>;
