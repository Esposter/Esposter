import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlWrapperNode } from "#src/models/MjmlWrapperNode";
import type { MjmlWrapperProps } from "#src/models/MjmlWrapperProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { sectionPropsSchema } from "#src/services/components/mjSection";
import { sectionAttributes } from "#src/services/components/sectionAttributes";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes the wrapper takes: its section's, and its gap
export const wrapperGapAttributes = { gap: "unit(px)" };
export const wrapperAttributes: typeof sectionAttributes.allowedAttributes & typeof wrapperGapAttributes = {
  ...sectionAttributes.allowedAttributes,
  ...wrapperGapAttributes,
};

export const wrapperPropsSchema: z.ZodObject<
  typeof sectionPropsSchema.shape & { gap: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({
  ...sectionPropsSchema.shape,
  gap: createMjmlAttributeSchema(wrapperGapAttributes.gap, "gap").optional(),
}) satisfies z.ZodType<OwnProps<MjmlWrapperProps>>;

// The wrapper component: the attributes it takes, the props its schema reads and what it renders
const mjmlWrapperTypeFields = {
  allowedAttributes: wrapperAttributes,
  contentKind: undefined,
  defaultAttributes: sectionAttributes.defaultAttributes,
  hasAlternativeText: false,
  propsSchema: wrapperPropsSchema,
  slots: { children: [MjmlNodeType.Hero, MjmlNodeType.Raw, MjmlNodeType.Section] },
  type: MjmlNodeType.Wrapper,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlWrapperNode>>;

export const mjmlWrapperType: MjmlBlockTypeDefinition<MjmlWrapperNode> = {
  ...mjmlWrapperTypeFields,
  render: renderMjmlNode({ ...mjmlWrapperTypeFields, hasChildren: true, tagName: MjmlNodeType.Wrapper }),
};
