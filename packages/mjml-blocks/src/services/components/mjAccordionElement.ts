import type { MjmlAccordionElementNode } from "#src/models/MjmlAccordionElementNode";
import type { MjmlAccordionElementProps } from "#src/models/MjmlAccordionElementProps";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the accordion element component, each in MJML's grammar
const accordionElementAttributes = {
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

// The accordion element component: the attributes it takes, the props its schema reads and what it renders
export const mjmlAccordionElementType: MjmlBlockTypeDefinition<MjmlAccordionElementNode> = {
  allowedAttributes: accordionElementAttributes,
  contentKind: undefined,
  defaultAttributes: {},
  hasAlternativeText: false,
  propsSchema: z.strictObject({ ...createMjmlAttributeShape(accordionElementAttributes) }) satisfies z.ZodType<
    OwnProps<MjmlAccordionElementProps>
  >,
  render: renderMjmlNode({
    allowedAttributes: accordionElementAttributes,
    contentKind: undefined,
    hasAlternativeText: false,
    hasChildren: true,
    tagName: MjmlNodeType.AccordionElement,
  }),
  slots: { children: [MjmlNodeType.AccordionTitle, MjmlNodeType.AccordionText, MjmlNodeType.Raw] },
  type: MjmlNodeType.AccordionElement,
};
