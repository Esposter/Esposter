import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlSpacerNode } from "#src/models/MjmlSpacerNode";
import type { MjmlSpacerProps } from "#src/models/MjmlSpacerProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the spacer component, each in MJML's grammar
const spacerAttributes = {
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

// The spacer component: the attributes it takes, the props its schema reads and what it renders
export const mjmlSpacerType: MjmlBlockTypeDefinition<MjmlSpacerNode> = {
  allowedAttributes: spacerAttributes,
  contentKind: undefined,
  defaultAttributes: { height: "20px" },
  hasAlternativeText: false,
  propsSchema: z.strictObject({ ...createMjmlAttributeShape(spacerAttributes) }) satisfies z.ZodType<
    OwnProps<MjmlSpacerProps>
  >,
  render: renderMjmlNode({
    allowedAttributes: spacerAttributes,
    contentKind: undefined,
    hasAlternativeText: false,
    hasChildren: false,
    tagName: MjmlNodeType.Spacer,
  }),
  slots: {},
  type: MjmlNodeType.Spacer,
};
