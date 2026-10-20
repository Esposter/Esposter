import type { MjmlAccordionTextNode } from "#src/models/MjmlAccordionTextNode";
import type { MjmlAccordionTextProps } from "#src/models/MjmlAccordionTextProps";
import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the accordion text component, each in MJML's grammar
export const accordionTextAttributes = {
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

export const createMjmlAccordionTextPropsSchema = <TContent>(
  richText: MjmlRichTextDefinition<TContent>,
): z.ZodObject<
  { [K in keyof typeof accordionTextAttributes]: MjmlAttributeSchema } & { content: z.ZodType<TContent> },
  z.core.$strict
> =>
  z.strictObject({
    "background-color": createMjmlAttributeSchema(
      accordionTextAttributes["background-color"],
      "background-color",
    ).optional(),
    color: createMjmlAttributeSchema(accordionTextAttributes.color, "color").optional(),
    content: richText.schema,
    "font-family": createMjmlAttributeSchema(accordionTextAttributes["font-family"], "font-family").optional(),
    "font-size": createMjmlAttributeSchema(accordionTextAttributes["font-size"], "font-size").optional(),
    "font-weight": createMjmlAttributeSchema(accordionTextAttributes["font-weight"], "font-weight").optional(),
    "letter-spacing": createMjmlAttributeSchema(accordionTextAttributes["letter-spacing"], "letter-spacing").optional(),
    "line-height": createMjmlAttributeSchema(accordionTextAttributes["line-height"], "line-height").optional(),
    padding: createMjmlAttributeSchema(accordionTextAttributes.padding, "padding").optional(),
    "padding-bottom": createMjmlAttributeSchema(accordionTextAttributes["padding-bottom"], "padding-bottom").optional(),
    "padding-left": createMjmlAttributeSchema(accordionTextAttributes["padding-left"], "padding-left").optional(),
    "padding-right": createMjmlAttributeSchema(accordionTextAttributes["padding-right"], "padding-right").optional(),
    "padding-top": createMjmlAttributeSchema(accordionTextAttributes["padding-top"], "padding-top").optional(),
  }) satisfies z.ZodType<OwnProps<MjmlAccordionTextProps>>;

// The accordion text component: the attributes it takes, the props its schema reads and what it renders
export const createMjmlAccordionTextType = <TContent>(
  richText: MjmlRichTextDefinition<TContent>,
): MjmlBlockTypeDefinition<MjmlAccordionTextNode> => ({
  allowedAttributes: accordionTextAttributes,
  contentKind: MjmlContentKind.RichText,
  defaultAttributes: { "font-size": "13px", "line-height": "1", padding: "16px" },
  hasAlternativeText: false,
  propsSchema: createMjmlAccordionTextPropsSchema(richText),
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
