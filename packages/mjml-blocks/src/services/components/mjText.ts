import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { MjmlTextNode } from "#src/models/MjmlTextNode";
import type { MjmlTextProps } from "#src/models/MjmlTextProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the text component, each in MJML's grammar
export const textAttributes = {
  align: "enum(left,right,center,justify)",
  "background-color": "color",
  color: "color",
  "container-background-color": "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-style": "string",
  "font-weight": "string",
  height: "unit(px,%)",
  "letter-spacing": "unitWithNegative(px,em)",
  "line-height": "unit(px,%,)",
  padding: "unit(px,%){1,4}",
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
  "text-decoration": "string",
  "text-transform": "string",
  "vertical-align": "enum(top,bottom,middle)",
};

export const createMjmlTextPropsSchema = <TContent>(
  richText: MjmlRichTextDefinition<TContent>,
): z.ZodObject<
  { [K in keyof typeof textAttributes]: MjmlAttributeSchema } & { content: z.ZodType<TContent> },
  z.core.$strict
> =>
  z.strictObject({
    align: createMjmlAttributeSchema(textAttributes.align, "align").optional(),
    "background-color": createMjmlAttributeSchema(textAttributes["background-color"], "background-color").optional(),
    color: createMjmlAttributeSchema(textAttributes.color, "color").optional(),
    "container-background-color": createMjmlAttributeSchema(
      textAttributes["container-background-color"],
      "container-background-color",
    ).optional(),
    content: richText.schema,
    "font-family": createMjmlAttributeSchema(textAttributes["font-family"], "font-family").optional(),
    "font-size": createMjmlAttributeSchema(textAttributes["font-size"], "font-size").optional(),
    "font-style": createMjmlAttributeSchema(textAttributes["font-style"], "font-style").optional(),
    "font-weight": createMjmlAttributeSchema(textAttributes["font-weight"], "font-weight").optional(),
    height: createMjmlAttributeSchema(textAttributes.height, "height").optional(),
    "letter-spacing": createMjmlAttributeSchema(textAttributes["letter-spacing"], "letter-spacing").optional(),
    "line-height": createMjmlAttributeSchema(textAttributes["line-height"], "line-height").optional(),
    padding: createMjmlAttributeSchema(textAttributes.padding, "padding").optional(),
    "padding-bottom": createMjmlAttributeSchema(textAttributes["padding-bottom"], "padding-bottom").optional(),
    "padding-left": createMjmlAttributeSchema(textAttributes["padding-left"], "padding-left").optional(),
    "padding-right": createMjmlAttributeSchema(textAttributes["padding-right"], "padding-right").optional(),
    "padding-top": createMjmlAttributeSchema(textAttributes["padding-top"], "padding-top").optional(),
    "text-decoration": createMjmlAttributeSchema(textAttributes["text-decoration"], "text-decoration").optional(),
    "text-transform": createMjmlAttributeSchema(textAttributes["text-transform"], "text-transform").optional(),
    "vertical-align": createMjmlAttributeSchema(textAttributes["vertical-align"], "vertical-align").optional(),
  }) satisfies z.ZodType<OwnProps<MjmlTextProps>>;

// The text component: the attributes it takes, the props its schema reads and what it renders
export const createMjmlTextType = <TContent>(
  richText: MjmlRichTextDefinition<TContent>,
): MjmlBlockTypeDefinition<MjmlTextNode> => ({
  allowedAttributes: textAttributes,
  contentKind: MjmlContentKind.RichText,
  defaultAttributes: {
    align: "left",
    color: "#000000",
    "font-family": "Ubuntu, Helvetica, Arial, sans-serif",
    "font-size": "13px",
    "line-height": "1",
    padding: "10px 25px",
  },
  hasAlternativeText: false,
  propsSchema: createMjmlTextPropsSchema(richText),
  render: renderMjmlNode(
    {
      allowedAttributes: textAttributes,
      contentKind: MjmlContentKind.RichText,
      hasAlternativeText: false,
      hasChildren: false,
      tagName: MjmlNodeType.Text,
    },
    richText,
  ),
  slots: {},
  type: MjmlNodeType.Text,
});
