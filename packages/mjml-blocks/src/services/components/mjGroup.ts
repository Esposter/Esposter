import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlGroupNode } from "#src/models/MjmlGroupNode";
import type { MjmlGroupProps } from "#src/models/MjmlGroupProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the group component, each in MJML's grammar
export const groupAttributes = {
  "background-color": "color",
  direction: "enum(ltr,rtl)",
  "vertical-align": "enum(top,bottom,middle)",
  width: "unit(px,%)",
};

export const groupPropsSchema: z.ZodObject<
  { [K in keyof typeof groupAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({
  "background-color": createMjmlAttributeSchema(groupAttributes["background-color"], "background-color").optional(),
  direction: createMjmlAttributeSchema(groupAttributes.direction, "direction").optional(),
  "vertical-align": createMjmlAttributeSchema(groupAttributes["vertical-align"], "vertical-align").optional(),
  width: createMjmlAttributeSchema(groupAttributes.width, "width").optional(),
}) satisfies z.ZodType<OwnProps<MjmlGroupProps>>;

// The group component: the attributes it takes, the props its schema reads and what it renders
export const mjmlGroupType: MjmlBlockTypeDefinition<MjmlGroupNode> = {
  allowedAttributes: groupAttributes,
  contentKind: undefined,
  defaultAttributes: { direction: "ltr" },
  hasAlternativeText: false,
  propsSchema: groupPropsSchema,
  render: renderMjmlNode({
    allowedAttributes: groupAttributes,
    contentKind: undefined,
    hasAlternativeText: false,
    hasChildren: true,
    tagName: MjmlNodeType.Group,
  }),
  slots: { children: [MjmlNodeType.Column, MjmlNodeType.Raw] },
  type: MjmlNodeType.Group,
};
