import type { JSONContent } from "@tiptap/core";
import type { Schema } from "@tiptap/pm/model";

import { jsonContentSchema } from "#shared/models/resource/note/NoteResource";
import { getResult } from "@esposter/shared";
import { z } from "zod";

// The Note's ProseMirror JSON, held to the text schema it renders through, so a node type or a mark the page cannot
// Render is refused at the boundary instead of at publish
export const createTextContentSchema = (schema: Schema): z.ZodType<JSONContent> =>
  jsonContentSchema.refine(
    (content) =>
      content.type === schema.topNodeType.name && getResult(() => schema.nodeFromJSON(content).check()).isOk(),
    { error: "Text content does not fit the text schema" },
  );
