import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlGroupNode } from "#src/models/MjmlGroupNode";
import type { MjmlGroupProps } from "#src/models/MjmlGroupProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the group component, each in MJML's grammar
const groupAttributes = {
  "background-color": "color",
  direction: "enum(ltr,rtl)",
  "vertical-align": "enum(top,bottom,middle)",
  width: "unit(px,%)",
};

// The group component: the attributes it takes, the props its schema reads and what it renders
export const mjmlGroupType: MjmlBlockTypeDefinition<MjmlGroupNode> = {
  allowedAttributes: groupAttributes,
  contentKind: undefined,
  defaultAttributes: { direction: "ltr" },
  hasAlternativeText: false,
  propsSchema: z.strictObject({ ...createMjmlAttributeShape(groupAttributes) }) satisfies z.ZodType<
    OwnProps<MjmlGroupProps>
  >,
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
