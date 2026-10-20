import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { MjmlRawProps } from "#src/models/MjmlRawProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { createMjmlRawContentSchema } from "#src/services/createMjmlRawContentSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the raw component, each in MJML's grammar
export const rawAttributes = { position: "enum(file-start)" };

export const rawPropsSchema: z.ZodObject<
  { [K in keyof typeof rawAttributes]: MjmlAttributeSchema } & { content: z.ZodString },
  z.core.$strict
> = z.strictObject({
  content: createMjmlRawContentSchema(),
  position: createMjmlAttributeSchema(rawAttributes.position, "position").optional(),
}) satisfies z.ZodType<OwnProps<MjmlRawProps>>;

// The raw component: the attributes it takes, the props its schema reads and what it renders
const mjmlRawTypeFields = {
  allowedAttributes: rawAttributes,
  contentKind: MjmlContentKind.Raw,
  defaultAttributes: {},
  hasAlternativeText: false,
  propsSchema: rawPropsSchema,
  slots: {},
  type: MjmlNodeType.Raw,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlRawNode>>;

export const mjmlRawType: MjmlBlockTypeDefinition<MjmlRawNode> = {
  ...mjmlRawTypeFields,
  render: renderMjmlNode({ ...mjmlRawTypeFields, hasChildren: false, tagName: MjmlNodeType.Raw }),
};
