import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { MjmlTextNode } from "#src/models/MjmlTextNode";
import type { MjmlTextProps } from "#src/models/MjmlTextProps";
import type { OwnProps } from "headless-block-editor";
import type { z } from "zod";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlRichTextPropsSchema } from "#src/services/components/createMjmlRichTextPropsSchema";
import { createMjmlRichTextType } from "#src/services/components/createMjmlRichTextType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";

// The attributes MJML takes on the text component, each in MJML's grammar
const textBaseAttributes = {
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
  "text-decoration": "string",
  "text-transform": "string",
  "vertical-align": "enum(top,bottom,middle)",
};

export const textAttributes: typeof MJML_PADDING_ATTRIBUTES & typeof textBaseAttributes = {
  ...textBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const createMjmlTextPropsSchema = <TContent extends MjmlRichText>(
  richText: MjmlRichTextDefinition<TContent>,
): z.ZodObject<
  { [K in keyof typeof textAttributes]: MjmlAttributeSchema } & { content: z.ZodType<TContent> },
  z.core.$strict
> =>
  createMjmlRichTextPropsSchema({ ...createMjmlAttributeShape(textAttributes) }, richText) satisfies z.ZodType<
    OwnProps<MjmlTextProps>
  >;

// The text component: the attributes it takes, the props its schema reads and what it renders
export const createMjmlTextType = <TContent extends MjmlRichText>(
  richText: MjmlRichTextDefinition<TContent>,
): MjmlBlockTypeDefinition<MjmlTextNode> =>
  createMjmlRichTextType<MjmlTextNode, TContent>(
    {
      allowedAttributes: textAttributes,
      defaultAttributes: {
        align: "left",
        color: "#000000",
        "font-family": "Ubuntu, Helvetica, Arial, sans-serif",
        "font-size": "13px",
        "line-height": "1",
        padding: "10px 25px",
      },
      propsSchema: createMjmlTextPropsSchema(richText),
      slots: {},
      type: MjmlNodeType.Text,
    },
    richText,
  );
