import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlWrapperNode } from "#src/models/MjmlWrapperNode";
import type { MjmlWrapperProps } from "#src/models/MjmlWrapperProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { sectionAttributes } from "#src/services/components/sectionAttributes";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The wrapper component: the attributes it takes, the props its schema reads and what it renders
export const mjmlWrapperType: MjmlBlockTypeDefinition<MjmlWrapperNode> = {
  allowedAttributes: { ...sectionAttributes.allowedAttributes, gap: "unit(px)" },
  contentKind: undefined,
  defaultAttributes: sectionAttributes.defaultAttributes,
  hasAlternativeText: false,
  propsSchema: z.strictObject({
    ...createMjmlAttributeShape({ ...sectionAttributes.allowedAttributes, gap: "unit(px)" }),
  }) satisfies z.ZodType<OwnProps<MjmlWrapperProps>>,
  render: renderMjmlNode({
    allowedAttributes: { ...sectionAttributes.allowedAttributes, gap: "unit(px)" },
    contentKind: undefined,
    hasAlternativeText: false,
    hasChildren: true,
    tagName: MjmlNodeType.Wrapper,
  }),
  slots: { children: [MjmlNodeType.Hero, MjmlNodeType.Raw, MjmlNodeType.Section] },
  type: MjmlNodeType.Wrapper,
};
