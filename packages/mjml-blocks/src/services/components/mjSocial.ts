import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlSocialNode } from "#src/models/MjmlSocialNode";
import type { MjmlSocialProps } from "#src/models/MjmlSocialProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the social component, each in MJML's grammar
const socialBaseAttributes = {
  align: "enum(left,right,center)",
  border: "string",
  "border-radius": "string",
  color: "color",
  "container-background-color": "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-style": "string",
  "font-weight": "string",
  "icon-height": "unit(px,%)",
  "icon-padding": "unit(px,%){1,4}",
  "icon-size": "unit(px,%)",
  "inner-padding": "unit(px,%){1,4}",
  "line-height": "unit(px,%,)",
  mode: "enum(horizontal,vertical)",
  padding: "unit(px,%){1,4}",
  "table-layout": "enum(auto,fixed)",
  "text-decoration": "string",
  "text-padding": "unit(px,%){1,4}",
  "vertical-align": "enum(top,bottom,middle)",
};

export const socialAttributes: typeof MJML_PADDING_ATTRIBUTES & typeof socialBaseAttributes = {
  ...socialBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const socialPropsSchema: z.ZodObject<
  { [K in keyof typeof socialAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({
  align: createMjmlAttributeSchema(socialAttributes.align, "align").optional(),
  border: createMjmlAttributeSchema(socialAttributes.border, "border").optional(),
  "border-radius": createMjmlAttributeSchema(socialAttributes["border-radius"], "border-radius").optional(),
  color: createMjmlAttributeSchema(socialAttributes.color, "color").optional(),
  "container-background-color": createMjmlAttributeSchema(
    socialAttributes["container-background-color"],
    "container-background-color",
  ).optional(),
  "font-family": createMjmlAttributeSchema(socialAttributes["font-family"], "font-family").optional(),
  "font-size": createMjmlAttributeSchema(socialAttributes["font-size"], "font-size").optional(),
  "font-style": createMjmlAttributeSchema(socialAttributes["font-style"], "font-style").optional(),
  "font-weight": createMjmlAttributeSchema(socialAttributes["font-weight"], "font-weight").optional(),
  "icon-height": createMjmlAttributeSchema(socialAttributes["icon-height"], "icon-height").optional(),
  "icon-padding": createMjmlAttributeSchema(socialAttributes["icon-padding"], "icon-padding").optional(),
  "icon-size": createMjmlAttributeSchema(socialAttributes["icon-size"], "icon-size").optional(),
  "inner-padding": createMjmlAttributeSchema(socialAttributes["inner-padding"], "inner-padding").optional(),
  "line-height": createMjmlAttributeSchema(socialAttributes["line-height"], "line-height").optional(),
  mode: createMjmlAttributeSchema(socialAttributes.mode, "mode").optional(),
  padding: createMjmlAttributeSchema(socialAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(socialAttributes["padding-bottom"], "padding-bottom").optional(),
  "padding-left": createMjmlAttributeSchema(socialAttributes["padding-left"], "padding-left").optional(),
  "padding-right": createMjmlAttributeSchema(socialAttributes["padding-right"], "padding-right").optional(),
  "padding-top": createMjmlAttributeSchema(socialAttributes["padding-top"], "padding-top").optional(),
  "table-layout": createMjmlAttributeSchema(socialAttributes["table-layout"], "table-layout").optional(),
  "text-decoration": createMjmlAttributeSchema(socialAttributes["text-decoration"], "text-decoration").optional(),
  "text-padding": createMjmlAttributeSchema(socialAttributes["text-padding"], "text-padding").optional(),
  "vertical-align": createMjmlAttributeSchema(socialAttributes["vertical-align"], "vertical-align").optional(),
}) satisfies z.ZodType<OwnProps<MjmlSocialProps>>;

// The social component: the attributes it takes, the props its schema reads and what it renders
const mjmlSocialTypeFields = {
  allowedAttributes: socialAttributes,
  contentKind: undefined,
  defaultAttributes: {
    align: "center",
    "border-radius": "3px",
    color: "#333333",
    "font-family": "Ubuntu, Helvetica, Arial, sans-serif",
    "font-size": "13px",
    "icon-size": "20px",
    "line-height": "22px",
    mode: "horizontal",
    padding: "10px 25px",
    "text-decoration": "none",
  },
  hasAlternativeText: false,
  propsSchema: socialPropsSchema,
  slots: { children: [MjmlNodeType.SocialElement, MjmlNodeType.Raw] },
  type: MjmlNodeType.Social,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlSocialNode>>;

export const mjmlSocialType: MjmlBlockTypeDefinition<MjmlSocialNode> = {
  ...mjmlSocialTypeFields,
  render: renderMjmlNode({ ...mjmlSocialTypeFields, hasChildren: true, tagName: MjmlNodeType.Social }),
};
