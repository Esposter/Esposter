import type { MjmlAccordionNode } from "#src/models/MjmlAccordionNode";
import type { MjmlAccordionProps } from "#src/models/MjmlAccordionProps";
import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the accordion component, each in MJML's grammar
const accordionBaseAttributes = {
  border: "string",
  "container-background-color": "color",
  "font-family": "string",
  "icon-align": "enum(top,middle,bottom)",
  "icon-height": "unit(px,%)",
  "icon-position": "enum(left,right)",
  "icon-unwrapped-alt": "string",
  "icon-unwrapped-url": "string",
  "icon-width": "unit(px,%)",
  "icon-wrapped-alt": "string",
  "icon-wrapped-url": "string",
  padding: "unit(px,%){1,4}",
};

export const accordionAttributes: typeof accordionBaseAttributes & typeof MJML_PADDING_ATTRIBUTES = {
  ...accordionBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const accordionPropsSchema: z.ZodObject<
  { [K in keyof typeof accordionAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({ ...createMjmlAttributeShape(accordionAttributes) }) satisfies z.ZodType<
  OwnProps<MjmlAccordionProps>
>;

// The accordion component: the attributes it takes, the props its schema reads and what it renders
const mjmlAccordionTypeFields = {
  allowedAttributes: accordionAttributes,
  contentKind: undefined,
  defaultAttributes: {
    border: "2px solid black",
    "font-family": "Ubuntu, Helvetica, Arial, sans-serif",
    "icon-align": "middle",
    "icon-height": "32px",
    "icon-position": "right",
    "icon-unwrapped-alt": "-",
    "icon-unwrapped-url": "https://i.imgur.com/w4uTygT.png",
    "icon-width": "32px",
    "icon-wrapped-alt": "+",
    "icon-wrapped-url": "https://i.imgur.com/bIXv1bk.png",
    padding: "10px 25px",
  },
  hasAlternativeText: false,
  propsSchema: accordionPropsSchema,
  slots: { children: [MjmlNodeType.AccordionElement, MjmlNodeType.Raw] },
  type: MjmlNodeType.Accordion,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlAccordionNode>>;

export const mjmlAccordionType: MjmlBlockTypeDefinition<MjmlAccordionNode> = {
  ...mjmlAccordionTypeFields,
  render: renderMjmlNode({ ...mjmlAccordionTypeFields, hasChildren: true, tagName: MjmlNodeType.Accordion }),
};
