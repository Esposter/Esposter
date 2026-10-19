import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlColumnNode } from "#src/models/MjmlColumnNode";
import type { MjmlColumnProps } from "#src/models/MjmlColumnProps";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the column component, each in MJML's grammar
const columnAttributes = {
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
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
  "vertical-align": "enum(top,bottom,middle)",
  width: "unit(px,%)",
};

// The column component: the attributes it takes, the props its schema reads and what it renders
export const createMjmlColumnType = (leafTypes: MjmlLeafNode["type"][]): MjmlBlockTypeDefinition<MjmlColumnNode> => ({
  allowedAttributes: columnAttributes,
  contentKind: undefined,
  defaultAttributes: { direction: "ltr", "vertical-align": "top" },
  hasAlternativeText: false,
  propsSchema: z.strictObject({ ...createMjmlAttributeShape(columnAttributes) }) satisfies z.ZodType<
    OwnProps<MjmlColumnProps>
  >,
  render: renderMjmlNode({
    allowedAttributes: columnAttributes,
    contentKind: undefined,
    hasAlternativeText: false,
    hasChildren: true,
    tagName: MjmlNodeType.Column,
  }),
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
});
