import type { MjmlAccordionTextNode } from "#src/models/MjmlAccordionTextNode";
import type { MjmlAccordionTextProps } from "#src/models/MjmlAccordionTextProps";
import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { OwnProps } from "headless-block-editor";
import type { z } from "zod";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlRichTextPropsSchema } from "#src/services/components/createMjmlRichTextPropsSchema";
import { createMjmlRichTextType } from "#src/services/components/createMjmlRichTextType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";

// The attributes MJML takes on the accordion text component, each in MJML's grammar
const accordionTextBaseAttributes = {
  "background-color": "color",
  color: "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-weight": "string",
  "letter-spacing": "unitWithNegative(px,em)",
  "line-height": "unit(px,%,)",
  padding: "unit(px,%){1,4}",
};

export const accordionTextAttributes: typeof accordionTextBaseAttributes & typeof MJML_PADDING_ATTRIBUTES = {
  ...accordionTextBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const createMjmlAccordionTextPropsSchema = <TContent extends MjmlRichText>(
  richText: MjmlRichTextDefinition<TContent>,
): z.ZodObject<
  { [K in keyof typeof accordionTextAttributes]: MjmlAttributeSchema } & { content: z.ZodType<TContent> },
  z.core.$strict
> =>
  createMjmlRichTextPropsSchema({ ...createMjmlAttributeShape(accordionTextAttributes) }, richText) satisfies z.ZodType<
    OwnProps<MjmlAccordionTextProps>
  >;

// The accordion text component: the attributes it takes, the props its schema reads and what it renders
export const createMjmlAccordionTextType = <TContent extends MjmlRichText>(
  richText: MjmlRichTextDefinition<TContent>,
): MjmlBlockTypeDefinition<MjmlAccordionTextNode> =>
  createMjmlRichTextType<MjmlAccordionTextNode, TContent>(
    {
      allowedAttributes: accordionTextAttributes,
      defaultAttributes: { "font-size": "13px", "line-height": "1", padding: "16px" },
      propsSchema: createMjmlAccordionTextPropsSchema(richText),
      slots: {},
      type: MjmlNodeType.AccordionText,
    },
    richText,
  );
