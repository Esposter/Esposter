import type { MjmlAccordionNode } from "#src/models/MjmlAccordionNode";
import type { MjmlAccordionProps } from "#src/models/MjmlAccordionProps";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the accordion component, each in MJML's grammar
const accordionAttributes = {
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

// The accordion component: the attributes it takes, the props its schema reads and what it renders
export const mjmlAccordionType: MjmlBlockTypeDefinition<MjmlAccordionNode> = {
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
  propsSchema: z.strictObject({ ...createMjmlAttributeShape(accordionAttributes) }) satisfies z.ZodType<
    OwnProps<MjmlAccordionProps>
  >,
  render: renderMjmlNode({
    allowedAttributes: accordionAttributes,
    contentKind: undefined,
    hasAlternativeText: false,
    hasChildren: true,
    tagName: MjmlNodeType.Accordion,
  }),
  slots: { children: [MjmlNodeType.AccordionElement, MjmlNodeType.Raw] },
  type: MjmlNodeType.Accordion,
};
