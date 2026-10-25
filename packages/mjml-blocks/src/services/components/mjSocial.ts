import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlSocialNode } from "#src/models/MjmlSocialNode";
import type { MjmlSocialProps } from "#src/models/MjmlSocialProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
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
> = z.strictObject({ ...createMjmlAttributeShape(socialAttributes) }) satisfies z.ZodType<OwnProps<MjmlSocialProps>>;

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
  formSchema: z.strictObject({}),
  slots: { children: [MjmlNodeType.SocialElement, MjmlNodeType.Raw] },
  type: MjmlNodeType.Social,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlSocialNode>>;

export const mjmlSocialType: MjmlBlockTypeDefinition<MjmlSocialNode> = {
  ...mjmlSocialTypeFields,
  render: renderMjmlNode({ ...mjmlSocialTypeFields, hasChildren: true, tagName: MjmlNodeType.Social }),
};
