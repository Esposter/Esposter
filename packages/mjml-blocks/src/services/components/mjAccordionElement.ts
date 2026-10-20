import type { MjmlAccordionElementNode } from "#src/models/MjmlAccordionElementNode";
import type { MjmlAccordionElementProps } from "#src/models/MjmlAccordionElementProps";
import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the accordion element component, each in MJML's grammar
export const accordionElementAttributes = {
  "background-color": "color",
  border: "string",
  "font-family": "string",
  "icon-align": "enum(top,middle,bottom)",
  "icon-height": "unit(px,%)",
  "icon-position": "enum(left,right)",
  "icon-unwrapped-alt": "string",
  "icon-unwrapped-url": "string",
  "icon-width": "unit(px,%)",
  "icon-wrapped-alt": "string",
  "icon-wrapped-url": "string",
};

export const accordionElementPropsSchema: z.ZodObject<
  { [K in keyof typeof accordionElementAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({
  "background-color": createMjmlAttributeSchema(
    accordionElementAttributes["background-color"],
    "background-color",
  ).optional(),
  border: createMjmlAttributeSchema(accordionElementAttributes.border, "border").optional(),
  "font-family": createMjmlAttributeSchema(accordionElementAttributes["font-family"], "font-family").optional(),
  "icon-align": createMjmlAttributeSchema(accordionElementAttributes["icon-align"], "icon-align").optional(),
  "icon-height": createMjmlAttributeSchema(accordionElementAttributes["icon-height"], "icon-height").optional(),
  "icon-position": createMjmlAttributeSchema(accordionElementAttributes["icon-position"], "icon-position").optional(),
  "icon-unwrapped-alt": createMjmlAttributeSchema(
    accordionElementAttributes["icon-unwrapped-alt"],
    "icon-unwrapped-alt",
  ).optional(),
  "icon-unwrapped-url": createMjmlAttributeSchema(
    accordionElementAttributes["icon-unwrapped-url"],
    "icon-unwrapped-url",
  ).optional(),
  "icon-width": createMjmlAttributeSchema(accordionElementAttributes["icon-width"], "icon-width").optional(),
  "icon-wrapped-alt": createMjmlAttributeSchema(
    accordionElementAttributes["icon-wrapped-alt"],
    "icon-wrapped-alt",
  ).optional(),
  "icon-wrapped-url": createMjmlAttributeSchema(
    accordionElementAttributes["icon-wrapped-url"],
    "icon-wrapped-url",
  ).optional(),
}) satisfies z.ZodType<OwnProps<MjmlAccordionElementProps>>;

// The accordion element component: the attributes it takes, the props its schema reads and what it renders
const mjmlAccordionElementTypeFields = {
  allowedAttributes: accordionElementAttributes,
  contentKind: undefined,
  defaultAttributes: {},
  hasAlternativeText: false,
  propsSchema: accordionElementPropsSchema,
  slots: { children: [MjmlNodeType.AccordionTitle, MjmlNodeType.AccordionText, MjmlNodeType.Raw] },
  type: MjmlNodeType.AccordionElement,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlAccordionElementNode>>;

export const mjmlAccordionElementType: MjmlBlockTypeDefinition<MjmlAccordionElementNode> = {
  ...mjmlAccordionElementTypeFields,
  render: renderMjmlNode({
    ...mjmlAccordionElementTypeFields,
    hasChildren: true,
    tagName: MjmlNodeType.AccordionElement,
  }),
};
