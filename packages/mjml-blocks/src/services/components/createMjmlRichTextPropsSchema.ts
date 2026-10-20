import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";

import { z } from "zod";

// A rich-text component's props schema: its attributes beside its content, which the consumer's rich text schema parses
export const createMjmlRichTextPropsSchema = <
  TShape extends Record<string, MjmlAttributeSchema>,
  TContent extends MjmlRichText,
>(
  attributesSchema: TShape,
  richText: MjmlRichTextDefinition<TContent>,
): z.ZodObject<TShape & { content: z.ZodType<TContent> }, z.core.$strict> =>
  z.strictObject({ ...attributesSchema, content: richText.schema });
