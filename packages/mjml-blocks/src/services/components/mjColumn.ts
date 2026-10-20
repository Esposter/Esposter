import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlColumnNode } from "#src/models/MjmlColumnNode";
import type { MjmlColumnProps } from "#src/models/MjmlColumnProps";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
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
> = z.strictObject({ ...createMjmlAttributeShape(columnAttributes) }) satisfies z.ZodType<OwnProps<MjmlColumnProps>>;

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
