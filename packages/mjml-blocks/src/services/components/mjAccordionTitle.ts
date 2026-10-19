import type { MjmlAccordionTitleNode } from "#src/models/MjmlAccordionTitleNode";
import type { MjmlAccordionTitleProps } from "#src/models/MjmlAccordionTitleProps";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the accordion title component, each in MJML's grammar
const accordionTitleAttributes = {
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

// The accordion title component: the attributes it takes, the props its schema reads and what it renders
export const mjmlAccordionTitleType: MjmlBlockTypeDefinition<MjmlAccordionTitleNode> = {
  allowedAttributes: accordionTitleAttributes,
  contentKind: MjmlContentKind.Label,
  defaultAttributes: { "font-size": "13px", padding: "16px" },
  hasAlternativeText: false,
  propsSchema: z.strictObject({
    ...createMjmlAttributeShape(accordionTitleAttributes),
    content: z.string(),
  }) satisfies z.ZodType<OwnProps<MjmlAccordionTitleProps>>,
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
