import type { MjmlAccordionTitleNode } from "#src/models/MjmlAccordionTitleNode";
import type { MjmlAccordionTitleProps } from "#src/models/MjmlAccordionTitleProps";
import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the accordion title component, each in MJML's grammar
export const accordionTitleAttributes = {
  "background-color": "color",
  color: "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-weight": "string",
  padding: "unit(px,%){1,4}",
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
};

export const accordionTitlePropsSchema: z.ZodObject<
  { [K in keyof typeof accordionTitleAttributes]: MjmlAttributeSchema } & { content: z.ZodString },
  z.core.$strict
> = z.strictObject({
  "background-color": createMjmlAttributeSchema(
    accordionTitleAttributes["background-color"],
    "background-color",
  ).optional(),
  color: createMjmlAttributeSchema(accordionTitleAttributes.color, "color").optional(),
  content: z.string(),
  "font-family": createMjmlAttributeSchema(accordionTitleAttributes["font-family"], "font-family").optional(),
  "font-size": createMjmlAttributeSchema(accordionTitleAttributes["font-size"], "font-size").optional(),
  "font-weight": createMjmlAttributeSchema(accordionTitleAttributes["font-weight"], "font-weight").optional(),
  padding: createMjmlAttributeSchema(accordionTitleAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(accordionTitleAttributes["padding-bottom"], "padding-bottom").optional(),
  "padding-left": createMjmlAttributeSchema(accordionTitleAttributes["padding-left"], "padding-left").optional(),
  "padding-right": createMjmlAttributeSchema(accordionTitleAttributes["padding-right"], "padding-right").optional(),
  "padding-top": createMjmlAttributeSchema(accordionTitleAttributes["padding-top"], "padding-top").optional(),
}) satisfies z.ZodType<OwnProps<MjmlAccordionTitleProps>>;

// The accordion title component: the attributes it takes, the props its schema reads and what it renders
export const mjmlAccordionTitleType: MjmlBlockTypeDefinition<MjmlAccordionTitleNode> = {
  allowedAttributes: accordionTitleAttributes,
  contentKind: MjmlContentKind.Label,
  defaultAttributes: { "font-size": "13px", padding: "16px" },
  hasAlternativeText: false,
  propsSchema: accordionTitlePropsSchema,
  render: renderMjmlNode({
    allowedAttributes: accordionTitleAttributes,
    contentKind: MjmlContentKind.Label,
    hasAlternativeText: false,
    hasChildren: false,
    tagName: MjmlNodeType.AccordionTitle,
  }),
  slots: {},
  type: MjmlNodeType.AccordionTitle,
};
