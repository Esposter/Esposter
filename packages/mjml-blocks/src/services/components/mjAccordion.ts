import type { MjmlAccordionNode } from "#src/models/MjmlAccordionNode";
import type { MjmlAccordionProps } from "#src/models/MjmlAccordionProps";
import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the accordion component, each in MJML's grammar
export const accordionAttributes = {
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
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
};

export const accordionPropsSchema: z.ZodObject<
  { [K in keyof typeof accordionAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({
  border: createMjmlAttributeSchema(accordionAttributes.border, "border").optional(),
  "container-background-color": createMjmlAttributeSchema(
    accordionAttributes["container-background-color"],
    "container-background-color",
  ).optional(),
  "font-family": createMjmlAttributeSchema(accordionAttributes["font-family"], "font-family").optional(),
  "icon-align": createMjmlAttributeSchema(accordionAttributes["icon-align"], "icon-align").optional(),
  "icon-height": createMjmlAttributeSchema(accordionAttributes["icon-height"], "icon-height").optional(),
  "icon-position": createMjmlAttributeSchema(accordionAttributes["icon-position"], "icon-position").optional(),
  "icon-unwrapped-alt": createMjmlAttributeSchema(
    accordionAttributes["icon-unwrapped-alt"],
    "icon-unwrapped-alt",
  ).optional(),
  "icon-unwrapped-url": createMjmlAttributeSchema(
    accordionAttributes["icon-unwrapped-url"],
    "icon-unwrapped-url",
  ).optional(),
  "icon-width": createMjmlAttributeSchema(accordionAttributes["icon-width"], "icon-width").optional(),
  "icon-wrapped-alt": createMjmlAttributeSchema(accordionAttributes["icon-wrapped-alt"], "icon-wrapped-alt").optional(),
  "icon-wrapped-url": createMjmlAttributeSchema(accordionAttributes["icon-wrapped-url"], "icon-wrapped-url").optional(),
  padding: createMjmlAttributeSchema(accordionAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(accordionAttributes["padding-bottom"], "padding-bottom").optional(),
  "padding-left": createMjmlAttributeSchema(accordionAttributes["padding-left"], "padding-left").optional(),
  "padding-right": createMjmlAttributeSchema(accordionAttributes["padding-right"], "padding-right").optional(),
  "padding-top": createMjmlAttributeSchema(accordionAttributes["padding-top"], "padding-top").optional(),
}) satisfies z.ZodType<OwnProps<MjmlAccordionProps>>;

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
