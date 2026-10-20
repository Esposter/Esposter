import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlTableNode } from "#src/models/MjmlTableNode";
import type { MjmlTableProps } from "#src/models/MjmlTableProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { createMjmlRawContentSchema } from "#src/services/createMjmlRawContentSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the table component, each in MJML's grammar
const tableBaseAttributes = {
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
  role: "enum(none,presentation)",
  "table-layout": "enum(auto,fixed,initial,inherit)",
  "vertical-align": "enum(top,bottom,middle)",
  width: "unit(px,%,auto)",
};

export const tableAttributes: typeof MJML_PADDING_ATTRIBUTES & typeof tableBaseAttributes = {
  ...tableBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const tablePropsSchema: z.ZodObject<
  { [K in keyof typeof tableAttributes]: MjmlAttributeSchema } & { content: z.ZodString },
  z.core.$strict
> = z.strictObject({
  ...createMjmlAttributeShape(tableAttributes),
  content: createMjmlRawContentSchema(),
}) satisfies z.ZodType<OwnProps<MjmlTableProps>>;

// The table component: the attributes it takes, the props its schema reads and what it renders
const mjmlTableTypeFields = {
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
  slots: {},
  type: MjmlNodeType.Table,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlTableNode>>;

export const mjmlTableType: MjmlBlockTypeDefinition<MjmlTableNode> = {
  ...mjmlTableTypeFields,
  render: renderMjmlNode({ ...mjmlTableTypeFields, hasChildren: false, tagName: MjmlNodeType.Table }),
};
