import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlButtonNode } from "#src/models/MjmlButtonNode";
import type { MjmlButtonProps } from "#src/models/MjmlButtonProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { createMjmlLabelContentSchema } from "#src/services/createMjmlLabelContentSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the button component, each in MJML's grammar
const buttonBaseAttributes = {
  align: "enum(left,center,right)",
  "background-color": "color",
  border: "string",
  "border-bottom": "string",
  "border-left": "string",
  "border-radius": "string",
  "border-right": "string",
  "border-top": "string",
  color: "color",
  "container-background-color": "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-style": "string",
  "font-weight": "string",
  height: "unit(px,%)",
  href: "string",
  "inner-padding": "unit(px,%){1,4}",
  "letter-spacing": "unitWithNegative(px,em)",
  "line-height": "unit(px,%,)",
  name: "string",
  padding: "unit(px,%){1,4}",
  rel: "string",
  target: "string",
  "text-align": "enum(left,right,center)",
  "text-decoration": "string",
  "text-transform": "string",
  title: "string",
  "vertical-align": "enum(top,bottom,middle)",
  width: "unit(px,%)",
};

export const buttonAttributes: typeof buttonBaseAttributes & typeof MJML_PADDING_ATTRIBUTES = {
  ...buttonBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const buttonPropsSchema: z.ZodObject<
  { [K in keyof typeof buttonAttributes]: MjmlAttributeSchema } & { content: z.ZodString },
  z.core.$strict
> = z.strictObject({
  ...createMjmlAttributeShape(buttonAttributes),
  content: createMjmlLabelContentSchema(),
}) satisfies z.ZodType<OwnProps<MjmlButtonProps>>;

// The button component: the attributes it takes, the props its schema reads and what it renders
const mjmlButtonTypeFields = {
  allowedAttributes: buttonAttributes,
  contentKind: MjmlContentKind.Label,
  defaultAttributes: {
    align: "center",
    "background-color": "#414141",
    border: "none",
    "border-radius": "3px",
    color: "#ffffff",
    "font-family": "Ubuntu, Helvetica, Arial, sans-serif",
    "font-size": "13px",
    "font-weight": "normal",
    "inner-padding": "10px 25px",
    "line-height": "120%",
    padding: "10px 25px",
    target: "_blank",
    "text-decoration": "none",
    "text-transform": "none",
    "vertical-align": "middle",
  },
  hasAlternativeText: false,
  propsSchema: buttonPropsSchema,
  slots: {},
  type: MjmlNodeType.Button,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlButtonNode>>;

export const mjmlButtonType: MjmlBlockTypeDefinition<MjmlButtonNode> = {
  ...mjmlButtonTypeFields,
  render: renderMjmlNode({ ...mjmlButtonTypeFields, hasChildren: false, tagName: MjmlNodeType.Button }),
};
