import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlDividerNode } from "#src/models/MjmlDividerNode";
import type { MjmlDividerProps } from "#src/models/MjmlDividerProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the divider component, each in MJML's grammar
export const dividerAttributes = {
  align: "enum(left,center,right)",
  "border-color": "color",
  "border-style": "string",
  "border-width": "unit(px)",
  "container-background-color": "color",
  padding: "unit(px,%){1,4}",
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
  width: "unit(px,%)",
};

export const dividerPropsSchema: z.ZodObject<
  { [K in keyof typeof dividerAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({
  align: createMjmlAttributeSchema(dividerAttributes.align, "align").optional(),
  "border-color": createMjmlAttributeSchema(dividerAttributes["border-color"], "border-color").optional(),
  "border-style": createMjmlAttributeSchema(dividerAttributes["border-style"], "border-style").optional(),
  "border-width": createMjmlAttributeSchema(dividerAttributes["border-width"], "border-width").optional(),
  "container-background-color": createMjmlAttributeSchema(
    dividerAttributes["container-background-color"],
    "container-background-color",
  ).optional(),
  padding: createMjmlAttributeSchema(dividerAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(dividerAttributes["padding-bottom"], "padding-bottom").optional(),
  "padding-left": createMjmlAttributeSchema(dividerAttributes["padding-left"], "padding-left").optional(),
  "padding-right": createMjmlAttributeSchema(dividerAttributes["padding-right"], "padding-right").optional(),
  "padding-top": createMjmlAttributeSchema(dividerAttributes["padding-top"], "padding-top").optional(),
  width: createMjmlAttributeSchema(dividerAttributes.width, "width").optional(),
}) satisfies z.ZodType<OwnProps<MjmlDividerProps>>;

// The divider component: the attributes it takes, the props its schema reads and what it renders
const mjmlDividerTypeFields = {
  allowedAttributes: dividerAttributes,
  contentKind: undefined,
  defaultAttributes: {
    align: "center",
    "border-color": "#000000",
    "border-style": "solid",
    "border-width": "4px",
    padding: "10px 25px",
    width: "100%",
  },
  hasAlternativeText: false,
  propsSchema: dividerPropsSchema,
  slots: {},
  type: MjmlNodeType.Divider,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlDividerNode>>;

export const mjmlDividerType: MjmlBlockTypeDefinition<MjmlDividerNode> = {
  ...mjmlDividerTypeFields,
  render: renderMjmlNode({ ...mjmlDividerTypeFields, hasChildren: false, tagName: MjmlNodeType.Divider }),
};
