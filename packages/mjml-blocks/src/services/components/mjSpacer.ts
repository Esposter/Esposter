import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlSpacerNode } from "#src/models/MjmlSpacerNode";
import type { MjmlSpacerProps } from "#src/models/MjmlSpacerProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the spacer component, each in MJML's grammar
export const spacerAttributes = {
  border: "string",
  "border-bottom": "string",
  "border-left": "string",
  "border-right": "string",
  "border-top": "string",
  "container-background-color": "color",
  height: "unit(px,%)",
  padding: "unit(px,%){1,4}",
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
};

export const spacerPropsSchema: z.ZodObject<
  { [K in keyof typeof spacerAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({
  border: createMjmlAttributeSchema(spacerAttributes.border, "border").optional(),
  "border-bottom": createMjmlAttributeSchema(spacerAttributes["border-bottom"], "border-bottom").optional(),
  "border-left": createMjmlAttributeSchema(spacerAttributes["border-left"], "border-left").optional(),
  "border-right": createMjmlAttributeSchema(spacerAttributes["border-right"], "border-right").optional(),
  "border-top": createMjmlAttributeSchema(spacerAttributes["border-top"], "border-top").optional(),
  "container-background-color": createMjmlAttributeSchema(
    spacerAttributes["container-background-color"],
    "container-background-color",
  ).optional(),
  height: createMjmlAttributeSchema(spacerAttributes.height, "height").optional(),
  padding: createMjmlAttributeSchema(spacerAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(spacerAttributes["padding-bottom"], "padding-bottom").optional(),
  "padding-left": createMjmlAttributeSchema(spacerAttributes["padding-left"], "padding-left").optional(),
  "padding-right": createMjmlAttributeSchema(spacerAttributes["padding-right"], "padding-right").optional(),
  "padding-top": createMjmlAttributeSchema(spacerAttributes["padding-top"], "padding-top").optional(),
}) satisfies z.ZodType<OwnProps<MjmlSpacerProps>>;

// The spacer component: the attributes it takes, the props its schema reads and what it renders
const mjmlSpacerTypeFields = {
  allowedAttributes: spacerAttributes,
  contentKind: undefined,
  defaultAttributes: { height: "20px" },
  hasAlternativeText: false,
  propsSchema: spacerPropsSchema,
  slots: {},
  type: MjmlNodeType.Spacer,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlSpacerNode>>;

export const mjmlSpacerType: MjmlBlockTypeDefinition<MjmlSpacerNode> = {
  ...mjmlSpacerTypeFields,
  render: renderMjmlNode({ ...mjmlSpacerTypeFields, hasChildren: false, tagName: MjmlNodeType.Spacer }),
};
