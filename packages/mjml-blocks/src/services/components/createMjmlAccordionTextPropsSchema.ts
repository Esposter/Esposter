import type { MjmlAccordionTextProps } from "#src/models/MjmlAccordionTextProps";
import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { OwnProps } from "headless-block-editor";
import type { z } from "zod";

import { createMjmlRichTextPropsSchema } from "#src/services/components/createMjmlRichTextPropsSchema";
import { accordionTextAttributes } from "#src/services/components/mjAccordionText";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";

export const createMjmlAccordionTextPropsSchema = <TContent extends MjmlRichText>(
  richText: MjmlRichTextDefinition<TContent>,
): z.ZodObject<
  { [K in keyof typeof accordionTextAttributes]: MjmlAttributeSchema } & { content: z.ZodType<TContent> },
  z.core.$strict
> =>
  createMjmlRichTextPropsSchema({ ...createMjmlAttributeShape(accordionTextAttributes) }, richText) satisfies z.ZodType<
    OwnProps<MjmlAccordionTextProps>
  >;
