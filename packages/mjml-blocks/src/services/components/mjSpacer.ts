import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlSpacerNode } from "#src/models/MjmlSpacerNode";
import type { MjmlSpacerProps } from "#src/models/MjmlSpacerProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the spacer component, each in MJML's grammar
const spacerBaseAttributes = {
  border: "string",
  "border-bottom": "string",
  "border-left": "string",
  "border-right": "string",
  "border-top": "string",
  "container-background-color": "color",
  height: "unit(px,%)",
  padding: "unit(px,%){1,4}",
};

export const spacerAttributes: typeof MJML_PADDING_ATTRIBUTES & typeof spacerBaseAttributes = {
  ...spacerBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const spacerPropsSchema: z.ZodObject<
  { [K in keyof typeof spacerAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({ ...createMjmlAttributeShape(spacerAttributes) }) satisfies z.ZodType<OwnProps<MjmlSpacerProps>>;

// The spacer component: the attributes it takes, the props its schema reads and what it renders
const mjmlSpacerTypeFields = {
  allowedAttributes: spacerAttributes,
  contentKind: undefined,
  defaultAttributes: { height: "20px" },
  formSchema: z.strictObject({}),
  hasAlternativeText: false,
  propsSchema: spacerPropsSchema,
  slots: {},
  type: MjmlNodeType.Spacer,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlSpacerNode>>;

export const mjmlSpacerType: MjmlBlockTypeDefinition<MjmlSpacerNode> = {
  ...mjmlSpacerTypeFields,
  render: renderMjmlNode({ ...mjmlSpacerTypeFields, hasChildren: false, tagName: MjmlNodeType.Spacer }),
};
