import type { MjmlAccordionTextNode } from "#src/models/MjmlAccordionTextNode";
import type { MjmlAccordionTextProps } from "#src/models/MjmlAccordionTextProps";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the accordion text component, each in MJML's grammar
const accordionTextAttributes = {
  "background-color": "color",
  color: "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-weight": "string",
  "letter-spacing": "unitWithNegative(px,em)",
  "line-height": "unit(px,%,)",
  padding: "unit(px,%){1,4}",
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
};

// The accordion text component: the attributes it takes, the props its schema reads and what it renders
export const createMjmlAccordionTextType = <TContent>(
  richText: MjmlRichTextDefinition<TContent>,
): MjmlBlockTypeDefinition<MjmlAccordionTextNode> => ({
  allowedAttributes: accordionTextAttributes,
  contentKind: MjmlContentKind.RichText,
  defaultAttributes: { "font-size": "13px", "line-height": "1", padding: "16px" },
  hasAlternativeText: false,
  propsSchema: z.strictObject({
    ...createMjmlAttributeShape(accordionTextAttributes),
    content: richText.schema,
  }) satisfies z.ZodType<OwnProps<MjmlAccordionTextProps>>,
  render: renderMjmlNode(
    {
      allowedAttributes: accordionTextAttributes,
      contentKind: MjmlContentKind.RichText,
      hasAlternativeText: false,
      hasChildren: false,
      tagName: MjmlNodeType.AccordionText,
    },
    richText,
  ),
  slots: {},
  type: MjmlNodeType.AccordionText,
});
