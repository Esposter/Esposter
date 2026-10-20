import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlSocialElementNode } from "#src/models/MjmlSocialElementNode";
import type { MjmlSocialElementProps } from "#src/models/MjmlSocialElementProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the social element component, each in MJML's grammar
export const socialElementAttributes = {
  align: "enum(left,center,right)",
  alt: "string",
  "background-color": "color",
  border: "string",
  "border-radius": "string",
  color: "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-style": "string",
  "font-weight": "string",
  href: "string",
  "icon-height": "unit(px,%)",
  "icon-padding": "unit(px,%){1,4}",
  "icon-position": "enum(left,right)",
  "icon-size": "unit(px,%)",
  "line-height": "unit(px,%,)",
  name: "string",
  padding: "unit(px,%){1,4}",
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
  rel: "string",
  sizes: "string",
  src: "string",
  srcset: "string",
  target: "string",
  "text-decoration": "string",
  "text-padding": "unit(px,%){1,4}",
  title: "string",
  "vertical-align": "enum(top,middle,bottom)",
};

export const socialElementPropsSchema: z.ZodObject<
  { [K in keyof typeof socialElementAttributes]: MjmlAttributeSchema } & { content: z.ZodString },
  z.core.$strict
> = z.strictObject({
  align: createMjmlAttributeSchema(socialElementAttributes.align, "align").optional(),
  alt: createMjmlAttributeSchema(socialElementAttributes.alt, "alt").optional(),
  "background-color": createMjmlAttributeSchema(
    socialElementAttributes["background-color"],
    "background-color",
  ).optional(),
  border: createMjmlAttributeSchema(socialElementAttributes.border, "border").optional(),
  "border-radius": createMjmlAttributeSchema(socialElementAttributes["border-radius"], "border-radius").optional(),
  color: createMjmlAttributeSchema(socialElementAttributes.color, "color").optional(),
  content: z.string(),
  "font-family": createMjmlAttributeSchema(socialElementAttributes["font-family"], "font-family").optional(),
  "font-size": createMjmlAttributeSchema(socialElementAttributes["font-size"], "font-size").optional(),
  "font-style": createMjmlAttributeSchema(socialElementAttributes["font-style"], "font-style").optional(),
  "font-weight": createMjmlAttributeSchema(socialElementAttributes["font-weight"], "font-weight").optional(),
  href: createMjmlAttributeSchema(socialElementAttributes.href, "href").optional(),
  "icon-height": createMjmlAttributeSchema(socialElementAttributes["icon-height"], "icon-height").optional(),
  "icon-padding": createMjmlAttributeSchema(socialElementAttributes["icon-padding"], "icon-padding").optional(),
  "icon-position": createMjmlAttributeSchema(socialElementAttributes["icon-position"], "icon-position").optional(),
  "icon-size": createMjmlAttributeSchema(socialElementAttributes["icon-size"], "icon-size").optional(),
  "line-height": createMjmlAttributeSchema(socialElementAttributes["line-height"], "line-height").optional(),
  name: createMjmlAttributeSchema(socialElementAttributes.name, "name").optional(),
  padding: createMjmlAttributeSchema(socialElementAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(socialElementAttributes["padding-bottom"], "padding-bottom").optional(),
  "padding-left": createMjmlAttributeSchema(socialElementAttributes["padding-left"], "padding-left").optional(),
  "padding-right": createMjmlAttributeSchema(socialElementAttributes["padding-right"], "padding-right").optional(),
  "padding-top": createMjmlAttributeSchema(socialElementAttributes["padding-top"], "padding-top").optional(),
  rel: createMjmlAttributeSchema(socialElementAttributes.rel, "rel").optional(),
  sizes: createMjmlAttributeSchema(socialElementAttributes.sizes, "sizes").optional(),
  src: createMjmlAttributeSchema(socialElementAttributes.src, "src").optional(),
  srcset: createMjmlAttributeSchema(socialElementAttributes.srcset, "srcset").optional(),
  target: createMjmlAttributeSchema(socialElementAttributes.target, "target").optional(),
  "text-decoration": createMjmlAttributeSchema(
    socialElementAttributes["text-decoration"],
    "text-decoration",
  ).optional(),
  "text-padding": createMjmlAttributeSchema(socialElementAttributes["text-padding"], "text-padding").optional(),
  title: createMjmlAttributeSchema(socialElementAttributes.title, "title").optional(),
  "vertical-align": createMjmlAttributeSchema(socialElementAttributes["vertical-align"], "vertical-align").optional(),
}) satisfies z.ZodType<OwnProps<MjmlSocialElementProps>>;

// The social element component: the attributes it takes, the props its schema reads and what it renders
const mjmlSocialElementTypeFields = {
  allowedAttributes: socialElementAttributes,
  contentKind: MjmlContentKind.Label,
  defaultAttributes: {
    align: "left",
    alt: "",
    border: "0",
    "border-radius": "3px",
    color: "#000",
    "font-family": "Ubuntu, Helvetica, Arial, sans-serif",
    "font-size": "13px",
    "icon-position": "left",
    "line-height": "1",
    padding: "4px",
    target: "_blank",
    "text-decoration": "none",
    "text-padding": "4px 4px 4px 0",
    "vertical-align": "middle",
  },
  hasAlternativeText: false,
  propsSchema: socialElementPropsSchema,
  slots: {},
  type: MjmlNodeType.SocialElement,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlSocialElementNode>>;

export const mjmlSocialElementType: MjmlBlockTypeDefinition<MjmlSocialElementNode> = {
  ...mjmlSocialElementTypeFields,
  render: renderMjmlNode({ ...mjmlSocialElementTypeFields, hasChildren: false, tagName: MjmlNodeType.SocialElement }),
};
