import type { JSONContent } from "@tiptap/core";

import { getSchema } from "@tiptap/core";
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { z } from "zod";

// The Tiptap/ProseMirror JSON document is the source of truth at rest — HTML is only generated at the render
// Boundary (see the Note View), so the stored shape is the open-ended recursive ProseMirror node tree.
export interface NoteResource {
  doc: JSONContent;
}
// The recursive structure keeps attrs and future extension fields the editor persists. The document schema below
// Checks that each node and mark belongs to the writing kit this app actually loads.
const jsonContentSchema: z.ZodType<JSONContent> = z.lazy(() =>
  z.looseObject({
    attrs: z.record(z.string().max(MAX_RESOURCE_CONTENT_SIZE), z.unknown()).optional(),
    content: z.array(jsonContentSchema).max(MAX_RESOURCE_CONTENT_SIZE).optional(),
    marks: z
      .array(
        z.looseObject({
          attrs: z.record(z.string().max(MAX_RESOURCE_CONTENT_SIZE), z.unknown()).optional(),
          type: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
        }),
      )
      .max(MAX_RESOURCE_CONTENT_SIZE)
      .optional(),
    text: z.string().max(MAX_RESOURCE_CONTENT_SIZE).optional(),
    type: z.string().max(MAX_RESOURCE_CONTENT_SIZE).optional(),
  }),
);

const noteDocumentSchema = getSchema(getNoteExtensions());

export const noteResourceSchema = z.object({ doc: jsonContentSchema }).superRefine(({ doc }, ctx) => {
  try {
    noteDocumentSchema.nodeFromJSON(doc).check();
  } catch (error) {
    ctx.addIssue({ code: "custom", message: error instanceof Error ? error.message : String(error), path: ["doc"] });
  }
}) satisfies z.ZodType<NoteResource>;
