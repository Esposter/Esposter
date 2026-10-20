import type { MjmlAccordionTitleNode } from "#src/models/MjmlAccordionTitleNode";
import type { MjmlAccordionTitleProps } from "#src/models/MjmlAccordionTitleProps";
import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { createMjmlLabelContentSchema } from "#src/services/createMjmlLabelContentSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the accordion title component, each in MJML's grammar
const accordionTitleBaseAttributes = {
  "background-color": "color",
  color: "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-weight": "string",
  padding: "unit(px,%){1,4}",
};

export const accordionTitleAttributes: typeof accordionTitleBaseAttributes & typeof MJML_PADDING_ATTRIBUTES = {
  ...accordionTitleBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const accordionTitlePropsSchema: z.ZodObject<
  { [K in keyof typeof accordionTitleAttributes]: MjmlAttributeSchema } & { content: z.ZodString },
  z.core.$strict
> = z.strictObject({
  ...createMjmlAttributeShape(accordionTitleAttributes),
  content: createMjmlLabelContentSchema(),
}) satisfies z.ZodType<OwnProps<MjmlAccordionTitleProps>>;

// The accordion title component: the attributes it takes, the props its schema reads and what it renders
const mjmlAccordionTitleTypeFields = {
  allowedAttributes: accordionTitleAttributes,
  contentKind: MjmlContentKind.Label,
  defaultAttributes: { "font-size": "13px", padding: "16px" },
  hasAlternativeText: false,
  propsSchema: accordionTitlePropsSchema,
  slots: {},
  type: MjmlNodeType.AccordionTitle,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlAccordionTitleNode>>;

export const mjmlAccordionTitleType: MjmlBlockTypeDefinition<MjmlAccordionTitleNode> = {
  ...mjmlAccordionTitleTypeFields,
  render: renderMjmlNode({ ...mjmlAccordionTitleTypeFields, hasChildren: false, tagName: MjmlNodeType.AccordionTitle }),
};
