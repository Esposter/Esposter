import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { MjmlTextProps } from "#src/models/MjmlTextProps";
import type { OwnProps } from "headless-block-editor";
import type { z } from "zod";

import { createMjmlRichTextPropsSchema } from "#src/services/components/createMjmlRichTextPropsSchema";
import { textAttributes } from "#src/services/components/mjText";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";

export const createMjmlTextPropsSchema = <TContent extends MjmlRichText>(
  richText: MjmlRichTextDefinition<TContent>,
): z.ZodObject<
  { [K in keyof typeof textAttributes]: MjmlAttributeSchema } & { content: z.ZodType<TContent> },
  z.core.$strict
> =>
  createMjmlRichTextPropsSchema({ ...createMjmlAttributeShape(textAttributes) }, richText) satisfies z.ZodType<
    OwnProps<MjmlTextProps>
  >;
