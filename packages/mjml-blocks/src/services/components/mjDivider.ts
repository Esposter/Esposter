import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlDividerNode } from "#src/models/MjmlDividerNode";
import type { MjmlDividerProps } from "#src/models/MjmlDividerProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the divider component, each in MJML's grammar
const dividerAttributes = {
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

// The divider component: the attributes it takes, the props its schema reads and what it renders
export const mjmlDividerType: MjmlBlockTypeDefinition<MjmlDividerNode> = {
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
  propsSchema: z.strictObject({ ...createMjmlAttributeShape(dividerAttributes) }) satisfies z.ZodType<
    OwnProps<MjmlDividerProps>
  >,
  render: renderMjmlNode({
    allowedAttributes: dividerAttributes,
    contentKind: undefined,
    hasAlternativeText: false,
    hasChildren: false,
    tagName: MjmlNodeType.Divider,
  }),
  slots: {},
  type: MjmlNodeType.Divider,
};
