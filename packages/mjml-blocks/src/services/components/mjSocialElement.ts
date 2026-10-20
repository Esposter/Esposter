import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlSocialElementNode } from "#src/models/MjmlSocialElementNode";
import type { MjmlSocialElementProps } from "#src/models/MjmlSocialElementProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { createMjmlLabelContentSchema } from "#src/services/createMjmlLabelContentSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the social element component, each in MJML's grammar
const socialElementBaseAttributes = {
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

export const socialElementAttributes: typeof MJML_PADDING_ATTRIBUTES & typeof socialElementBaseAttributes = {
  ...socialElementBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const socialElementPropsSchema: z.ZodObject<
  { [K in keyof typeof socialElementAttributes]: MjmlAttributeSchema } & { content: z.ZodString },
  z.core.$strict
> = z.strictObject({
  ...createMjmlAttributeShape(socialElementAttributes),
  content: createMjmlLabelContentSchema(),
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
