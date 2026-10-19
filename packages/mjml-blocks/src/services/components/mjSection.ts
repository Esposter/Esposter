import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlSectionNode } from "#src/models/MjmlSectionNode";
import type { MjmlSectionProps } from "#src/models/MjmlSectionProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { sectionAttributes } from "#src/services/components/sectionAttributes";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The section component: the attributes it takes, the props its schema reads and what it renders
export const mjmlSectionType: MjmlBlockTypeDefinition<MjmlSectionNode> = {
  allowedAttributes: sectionAttributes.allowedAttributes,
  contentKind: undefined,
  defaultAttributes: sectionAttributes.defaultAttributes,
  hasAlternativeText: false,
  propsSchema: z.strictObject({ ...createMjmlAttributeShape(sectionAttributes.allowedAttributes) }) satisfies z.ZodType<
    OwnProps<MjmlSectionProps>
  >,
  render: renderMjmlNode({
    allowedAttributes: sectionAttributes.allowedAttributes,
    contentKind: undefined,
    hasAlternativeText: false,
    hasChildren: true,
    tagName: MjmlNodeType.Section,
  }),
  slots: { children: [MjmlNodeType.Column, MjmlNodeType.Group, MjmlNodeType.Raw] },
  type: MjmlNodeType.Section,
};
