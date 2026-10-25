import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlSectionNode } from "#src/models/MjmlSectionNode";
import type { MjmlSectionProps } from "#src/models/MjmlSectionProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { sectionAttributes } from "#src/services/components/sectionAttributes";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

export const sectionPropsSchema: z.ZodObject<
  { [K in keyof typeof sectionAttributes.allowedAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({ ...createMjmlAttributeShape(sectionAttributes.allowedAttributes) }) satisfies z.ZodType<
  OwnProps<MjmlSectionProps>
>;

// The section component: the attributes it takes, the props its schema reads and what it renders
const mjmlSectionTypeFields = {
  allowedAttributes: sectionAttributes.allowedAttributes,
  contentKind: undefined,
  defaultAttributes: sectionAttributes.defaultAttributes,
  formSchema: z.strictObject({}),
  hasAlternativeText: false,
  propsSchema: sectionPropsSchema,
  slots: { children: [MjmlNodeType.Column, MjmlNodeType.Group, MjmlNodeType.Raw] },
  type: MjmlNodeType.Section,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlSectionNode>>;

export const mjmlSectionType: MjmlBlockTypeDefinition<MjmlSectionNode> = {
  ...mjmlSectionTypeFields,
  render: renderMjmlNode({ ...mjmlSectionTypeFields, hasChildren: true, tagName: MjmlNodeType.Section }),
};
