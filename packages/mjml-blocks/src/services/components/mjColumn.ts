import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlColumnNode } from "#src/models/MjmlColumnNode";
import type { MjmlColumnProps } from "#src/models/MjmlColumnProps";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the column component, each in MJML's grammar
const columnBaseAttributes = {
  "background-color": "color",
  border: "string",
  "border-bottom": "string",
  "border-left": "string",
  "border-radius": "string",
  "border-right": "string",
  "border-top": "string",
  direction: "enum(ltr,rtl)",
  "inner-background-color": "color",
  "inner-border": "string",
  "inner-border-bottom": "string",
  "inner-border-left": "string",
  "inner-border-radius": "string",
  "inner-border-right": "string",
  "inner-border-top": "string",
  padding: "unit(px,%){1,4}",
  "vertical-align": "enum(top,bottom,middle)",
  width: "unit(px,%)",
};

export const columnAttributes: typeof columnBaseAttributes & typeof MJML_PADDING_ATTRIBUTES = {
  ...columnBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const columnPropsSchema: z.ZodObject<
  { [K in keyof typeof columnAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({
  "background-color": createMjmlAttributeSchema(columnAttributes["background-color"], "background-color").optional(),
  border: createMjmlAttributeSchema(columnAttributes.border, "border").optional(),
  "border-bottom": createMjmlAttributeSchema(columnAttributes["border-bottom"], "border-bottom").optional(),
  "border-left": createMjmlAttributeSchema(columnAttributes["border-left"], "border-left").optional(),
  "border-radius": createMjmlAttributeSchema(columnAttributes["border-radius"], "border-radius").optional(),
  "border-right": createMjmlAttributeSchema(columnAttributes["border-right"], "border-right").optional(),
  "border-top": createMjmlAttributeSchema(columnAttributes["border-top"], "border-top").optional(),
  direction: createMjmlAttributeSchema(columnAttributes.direction, "direction").optional(),
  "inner-background-color": createMjmlAttributeSchema(
    columnAttributes["inner-background-color"],
    "inner-background-color",
  ).optional(),
  "inner-border": createMjmlAttributeSchema(columnAttributes["inner-border"], "inner-border").optional(),
  "inner-border-bottom": createMjmlAttributeSchema(
    columnAttributes["inner-border-bottom"],
    "inner-border-bottom",
  ).optional(),
  "inner-border-left": createMjmlAttributeSchema(columnAttributes["inner-border-left"], "inner-border-left").optional(),
  "inner-border-radius": createMjmlAttributeSchema(
    columnAttributes["inner-border-radius"],
    "inner-border-radius",
  ).optional(),
  "inner-border-right": createMjmlAttributeSchema(
    columnAttributes["inner-border-right"],
    "inner-border-right",
  ).optional(),
  "inner-border-top": createMjmlAttributeSchema(columnAttributes["inner-border-top"], "inner-border-top").optional(),
  padding: createMjmlAttributeSchema(columnAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(columnAttributes["padding-bottom"], "padding-bottom").optional(),
  "padding-left": createMjmlAttributeSchema(columnAttributes["padding-left"], "padding-left").optional(),
  "padding-right": createMjmlAttributeSchema(columnAttributes["padding-right"], "padding-right").optional(),
  "padding-top": createMjmlAttributeSchema(columnAttributes["padding-top"], "padding-top").optional(),
  "vertical-align": createMjmlAttributeSchema(columnAttributes["vertical-align"], "vertical-align").optional(),
  width: createMjmlAttributeSchema(columnAttributes.width, "width").optional(),
}) satisfies z.ZodType<OwnProps<MjmlColumnProps>>;

// The column component: the attributes it takes, the props its schema reads and what it renders
export const createMjmlColumnType = (leafTypes: MjmlLeafNode["type"][]): MjmlBlockTypeDefinition<MjmlColumnNode> => {
  const columnTypeFields = {
    allowedAttributes: columnAttributes,
    contentKind: undefined,
    defaultAttributes: { direction: "ltr", "vertical-align": "top" },
    hasAlternativeText: false,
    propsSchema: columnPropsSchema,
    slots: {
      children: [
        MjmlNodeType.Accordion,
        MjmlNodeType.Button,
        MjmlNodeType.Carousel,
        MjmlNodeType.Divider,
        MjmlNodeType.Image,
        MjmlNodeType.Raw,
        MjmlNodeType.Social,
        MjmlNodeType.Spacer,
        MjmlNodeType.Table,
        MjmlNodeType.Text,
        MjmlNodeType.Navbar,
        ...leafTypes,
      ],
    },
    type: MjmlNodeType.Column,
  } satisfies Partial<MjmlBlockTypeDefinition<MjmlColumnNode>>;

  return {
    ...columnTypeFields,
    render: renderMjmlNode({ ...columnTypeFields, hasChildren: true, tagName: MjmlNodeType.Column }),
  };
};
