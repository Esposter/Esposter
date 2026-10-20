import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextAttributeValue } from "#src/models/MjmlRichTextAttributeValue";

import { z } from "zod";

const mjmlRichTextAttributeValueSchema: z.ZodType<MjmlRichTextAttributeValue> = z.lazy(() =>
  z.union([
    z.boolean(),
    z.number(),
    z.string(),
    z.array(mjmlRichTextAttributeValueSchema),
    z.record(z.string(), mjmlRichTextAttributeValueSchema),
  ]),
);
const mjmlRichTextAttributesSchema = z.record(z.string(), mjmlRichTextAttributeValueSchema);

// The rich text document's schema: a tree that parses as MjmlRichText, its recursion declared on the annotation
export const mjmlRichTextSchema: z.ZodType<MjmlRichText> = z.object({
  attrs: mjmlRichTextAttributesSchema.optional(),
  content: z.array(z.lazy(() => mjmlRichTextSchema)).optional(),
  marks: z.array(z.object({ attrs: mjmlRichTextAttributesSchema.optional(), type: z.string() })).optional(),
  text: z.string().optional(),
  type: z.string().optional(),
});
