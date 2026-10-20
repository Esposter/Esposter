import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlTableNode } from "#src/models/MjmlTableNode";
import type { MjmlTableProps } from "#src/models/MjmlTableProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { createMjmlRawContentSchema } from "#src/services/createMjmlRawContentSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the table component, each in MJML's grammar
export const tableAttributes = {
  align: "enum(left,right,center)",
  border: "string",
  cellpadding: "integer",
  cellspacing: "integer",
  color: "color",
  "container-background-color": "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-weight": "string",
  "line-height": "unit(px,%,)",
  padding: "unit(px,%){1,4}",
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
  role: "enum(none,presentation)",
  "table-layout": "enum(auto,fixed,initial,inherit)",
  "vertical-align": "enum(top,bottom,middle)",
  width: "unit(px,%,auto)",
};

export const tablePropsSchema: z.ZodObject<
  { [K in keyof typeof tableAttributes]: MjmlAttributeSchema } & { content: z.ZodString },
  z.core.$strict
> = z.strictObject({
  align: createMjmlAttributeSchema(tableAttributes.align, "align").optional(),
  border: createMjmlAttributeSchema(tableAttributes.border, "border").optional(),
  cellpadding: createMjmlAttributeSchema(tableAttributes.cellpadding, "cellpadding").optional(),
  cellspacing: createMjmlAttributeSchema(tableAttributes.cellspacing, "cellspacing").optional(),
  color: createMjmlAttributeSchema(tableAttributes.color, "color").optional(),
  "container-background-color": createMjmlAttributeSchema(
    tableAttributes["container-background-color"],
    "container-background-color",
  ).optional(),
  content: createMjmlRawContentSchema(),
  "font-family": createMjmlAttributeSchema(tableAttributes["font-family"], "font-family").optional(),
  "font-size": createMjmlAttributeSchema(tableAttributes["font-size"], "font-size").optional(),
  "font-weight": createMjmlAttributeSchema(tableAttributes["font-weight"], "font-weight").optional(),
  "line-height": createMjmlAttributeSchema(tableAttributes["line-height"], "line-height").optional(),
  padding: createMjmlAttributeSchema(tableAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(tableAttributes["padding-bottom"], "padding-bottom").optional(),
  "padding-left": createMjmlAttributeSchema(tableAttributes["padding-left"], "padding-left").optional(),
  "padding-right": createMjmlAttributeSchema(tableAttributes["padding-right"], "padding-right").optional(),
  "padding-top": createMjmlAttributeSchema(tableAttributes["padding-top"], "padding-top").optional(),
  role: createMjmlAttributeSchema(tableAttributes.role, "role").optional(),
  "table-layout": createMjmlAttributeSchema(tableAttributes["table-layout"], "table-layout").optional(),
  "vertical-align": createMjmlAttributeSchema(tableAttributes["vertical-align"], "vertical-align").optional(),
  width: createMjmlAttributeSchema(tableAttributes.width, "width").optional(),
}) satisfies z.ZodType<OwnProps<MjmlTableProps>>;

// The table component: the attributes it takes, the props its schema reads and what it renders
export const mjmlTableType: MjmlBlockTypeDefinition<MjmlTableNode> = {
  allowedAttributes: tableAttributes,
  contentKind: MjmlContentKind.Raw,
  defaultAttributes: {
    align: "left",
    border: "none",
    cellpadding: "0",
    cellspacing: "0",
    color: "#000000",
    "font-family": "Ubuntu, Helvetica, Arial, sans-serif",
    "font-size": "13px",
    "line-height": "22px",
    padding: "10px 25px",
    "table-layout": "auto",
    width: "100%",
  },
  hasAlternativeText: false,
  propsSchema: tablePropsSchema,
  render: renderMjmlNode({
    allowedAttributes: tableAttributes,
    contentKind: MjmlContentKind.Raw,
    hasAlternativeText: false,
    hasChildren: false,
    tagName: MjmlNodeType.Table,
  }),
  slots: {},
  type: MjmlNodeType.Table,
};
