import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlDividerNode } from "#src/models/MjmlDividerNode";
import type { MjmlDividerProps } from "#src/models/MjmlDividerProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the divider component, each in MJML's grammar
const dividerBaseAttributes = {
  align: "enum(left,center,right)",
  "border-color": "color",
  "border-style": "string",
  "border-width": "unit(px)",
  "container-background-color": "color",
  padding: "unit(px,%){1,4}",
  width: "unit(px,%)",
};

export const dividerAttributes: typeof dividerBaseAttributes & typeof MJML_PADDING_ATTRIBUTES = {
  ...dividerBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const dividerPropsSchema: z.ZodObject<
  { [K in keyof typeof dividerAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({ ...createMjmlAttributeShape(dividerAttributes) }) satisfies z.ZodType<OwnProps<MjmlDividerProps>>;

// The divider component: the attributes it takes, the props its schema reads and what it renders
const mjmlDividerTypeFields = {
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
  formSchema: z.strictObject({}),
  hasAlternativeText: false,
  propsSchema: dividerPropsSchema,
  slots: {},
  type: MjmlNodeType.Divider,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlDividerNode>>;

export const mjmlDividerType: MjmlBlockTypeDefinition<MjmlDividerNode> = {
  ...mjmlDividerTypeFields,
  render: renderMjmlNode({ ...mjmlDividerTypeFields, hasChildren: false, tagName: MjmlNodeType.Divider }),
};
