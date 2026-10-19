import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { MjmlTextNode } from "#src/models/MjmlTextNode";
import type { MjmlTextProps } from "#src/models/MjmlTextProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the text component, each in MJML's grammar
const textAttributes = {
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
  propsSchema: z.strictObject({
    ...createMjmlAttributeShape(textAttributes),
    content: richText.schema,
  }) satisfies z.ZodType<OwnProps<MjmlTextProps>>,
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
