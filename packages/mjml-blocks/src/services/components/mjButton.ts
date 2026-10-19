import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlButtonNode } from "#src/models/MjmlButtonNode";
import type { MjmlButtonProps } from "#src/models/MjmlButtonProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the button component, each in MJML's grammar
const buttonAttributes = {
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

// The button component: the attributes it takes, the props its schema reads and what it renders
export const mjmlButtonType: MjmlBlockTypeDefinition<MjmlButtonNode> = {
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
  propsSchema: z.strictObject({
    ...createMjmlAttributeShape(buttonAttributes),
    content: z.string(),
  }) satisfies z.ZodType<OwnProps<MjmlButtonProps>>,
  render: renderMjmlNode({
    allowedAttributes: buttonAttributes,
    contentKind: MjmlContentKind.Label,
    hasAlternativeText: false,
    hasChildren: false,
    tagName: MjmlNodeType.Button,
  }),
  slots: {},
  type: MjmlNodeType.Button,
};
