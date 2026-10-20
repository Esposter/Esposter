import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlButtonNode } from "#src/models/MjmlButtonNode";
import type { MjmlButtonProps } from "#src/models/MjmlButtonProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the button component, each in MJML's grammar
export const buttonAttributes = {
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
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
  rel: "string",
  target: "string",
  "text-align": "enum(left,right,center)",
  "text-decoration": "string",
  "text-transform": "string",
  title: "string",
  "vertical-align": "enum(top,bottom,middle)",
  width: "unit(px,%)",
};

export const buttonPropsSchema: z.ZodObject<
  { [K in keyof typeof buttonAttributes]: MjmlAttributeSchema } & { content: z.ZodString },
  z.core.$strict
> = z.strictObject({
  align: createMjmlAttributeSchema(buttonAttributes.align, "align").optional(),
  "background-color": createMjmlAttributeSchema(buttonAttributes["background-color"], "background-color").optional(),
  border: createMjmlAttributeSchema(buttonAttributes.border, "border").optional(),
  "border-bottom": createMjmlAttributeSchema(buttonAttributes["border-bottom"], "border-bottom").optional(),
  "border-left": createMjmlAttributeSchema(buttonAttributes["border-left"], "border-left").optional(),
  "border-radius": createMjmlAttributeSchema(buttonAttributes["border-radius"], "border-radius").optional(),
  "border-right": createMjmlAttributeSchema(buttonAttributes["border-right"], "border-right").optional(),
  "border-top": createMjmlAttributeSchema(buttonAttributes["border-top"], "border-top").optional(),
  color: createMjmlAttributeSchema(buttonAttributes.color, "color").optional(),
  "container-background-color": createMjmlAttributeSchema(
    buttonAttributes["container-background-color"],
    "container-background-color",
  ).optional(),
  content: z.string(),
  "font-family": createMjmlAttributeSchema(buttonAttributes["font-family"], "font-family").optional(),
  "font-size": createMjmlAttributeSchema(buttonAttributes["font-size"], "font-size").optional(),
  "font-style": createMjmlAttributeSchema(buttonAttributes["font-style"], "font-style").optional(),
  "font-weight": createMjmlAttributeSchema(buttonAttributes["font-weight"], "font-weight").optional(),
  height: createMjmlAttributeSchema(buttonAttributes.height, "height").optional(),
  href: createMjmlAttributeSchema(buttonAttributes.href, "href").optional(),
  "inner-padding": createMjmlAttributeSchema(buttonAttributes["inner-padding"], "inner-padding").optional(),
  "letter-spacing": createMjmlAttributeSchema(buttonAttributes["letter-spacing"], "letter-spacing").optional(),
  "line-height": createMjmlAttributeSchema(buttonAttributes["line-height"], "line-height").optional(),
  name: createMjmlAttributeSchema(buttonAttributes.name, "name").optional(),
  padding: createMjmlAttributeSchema(buttonAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(buttonAttributes["padding-bottom"], "padding-bottom").optional(),
  "padding-left": createMjmlAttributeSchema(buttonAttributes["padding-left"], "padding-left").optional(),
  "padding-right": createMjmlAttributeSchema(buttonAttributes["padding-right"], "padding-right").optional(),
  "padding-top": createMjmlAttributeSchema(buttonAttributes["padding-top"], "padding-top").optional(),
  rel: createMjmlAttributeSchema(buttonAttributes.rel, "rel").optional(),
  target: createMjmlAttributeSchema(buttonAttributes.target, "target").optional(),
  "text-align": createMjmlAttributeSchema(buttonAttributes["text-align"], "text-align").optional(),
  "text-decoration": createMjmlAttributeSchema(buttonAttributes["text-decoration"], "text-decoration").optional(),
  "text-transform": createMjmlAttributeSchema(buttonAttributes["text-transform"], "text-transform").optional(),
  title: createMjmlAttributeSchema(buttonAttributes.title, "title").optional(),
  "vertical-align": createMjmlAttributeSchema(buttonAttributes["vertical-align"], "vertical-align").optional(),
  width: createMjmlAttributeSchema(buttonAttributes.width, "width").optional(),
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
