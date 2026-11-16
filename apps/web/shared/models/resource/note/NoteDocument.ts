import type { JSONContent } from "@tiptap/core";

import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { createRecordSchema, getResult, noop } from "@esposter/shared";
import { getSchema } from "@tiptap/core";
import { z } from "zod";

const attributesSchema = createRecordSchema(
  z.string().max(MAX_RESOURCE_CONTENT_SIZE),
  z.unknown(),
  MAX_RESOURCE_CONTENT_SIZE,
);

// The recursive structure keeps attrs and future extension fields the editor persists. The document schema below
// Checks that each node and mark belongs to the writing kit this app actually loads. It mirrors tiptap's
// `JSONContent` key for key: a node's attrs may be undefined, as `getJSON()` writes them, and every other optional key
// Is set or missing, since tiptap never writes it undefined
const jsonContentSchema: z.ZodType<JSONContent> = z.lazy(() =>
  z.looseObject({
    attrs: attributesSchema.optional(),
    content: z.array(jsonContentSchema).max(MAX_RESOURCE_CONTENT_SIZE).exactOptional(),
    marks: z
      .array(
        z.looseObject({ attrs: attributesSchema.exactOptional(), type: z.string().max(MAX_RESOURCE_CONTENT_SIZE) }),
      )
      .max(MAX_RESOURCE_CONTENT_SIZE)
      .exactOptional(),
    text: z.string().max(MAX_RESOURCE_CONTENT_SIZE).exactOptional(),
    type: z.string().max(MAX_RESOURCE_CONTENT_SIZE).exactOptional(),
  }),
);

const noteSchema = getSchema(getNoteExtensions());
// A note's ProseMirror document, refused when the writing kit cannot build it, so a node it does not load never reaches
// A renderer. A text node of a webpage holds the same document, so both read this one schema
export const noteDocumentSchema = jsonContentSchema.superRefine((doc, context) => {
  getResult(() => {
    noteSchema.nodeFromJSON(doc).check();
  }).match(noop, (error) => {
    context.addIssue({ code: "custom", message: error.message, path: [] });
  });
});
