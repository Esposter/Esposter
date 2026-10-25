import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlGroupNode } from "#src/models/MjmlGroupNode";
import type { MjmlGroupProps } from "#src/models/MjmlGroupProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
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
> = z.strictObject({ ...createMjmlAttributeShape(groupAttributes) }) satisfies z.ZodType<OwnProps<MjmlGroupProps>>;

// The group component: the attributes it takes, the props its schema reads and what it renders
const mjmlGroupTypeFields = {
  allowedAttributes: groupAttributes,
  contentKind: undefined,
  defaultAttributes: { direction: "ltr" },
  hasAlternativeText: false,
  propsSchema: groupPropsSchema,
  formSchema: z.strictObject({}),
  slots: { children: [MjmlNodeType.Column, MjmlNodeType.Raw] },
  type: MjmlNodeType.Group,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlGroupNode>>;

export const mjmlGroupType: MjmlBlockTypeDefinition<MjmlGroupNode> = {
  ...mjmlGroupTypeFields,
  render: renderMjmlNode({ ...mjmlGroupTypeFields, hasChildren: true, tagName: MjmlNodeType.Group }),
};
