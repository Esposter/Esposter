import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { MjmlRawProps } from "#src/models/MjmlRawProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { createMjmlRawContentSchema } from "#src/services/createMjmlRawContentSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the raw component, each in MJML's grammar
const rawAttributes = { position: "enum(file-start)" };

// The raw component: the attributes it takes, the props its schema reads and what it renders
export const mjmlRawType: MjmlBlockTypeDefinition<MjmlRawNode> = {
  allowedAttributes: rawAttributes,
  contentKind: MjmlContentKind.Raw,
  defaultAttributes: {},
  hasAlternativeText: false,
  propsSchema: z.strictObject({
    ...createMjmlAttributeShape(rawAttributes),
    content: createMjmlRawContentSchema(),
  }) satisfies z.ZodType<OwnProps<MjmlRawProps>>,
  render: renderMjmlNode({
    allowedAttributes: rawAttributes,
    contentKind: MjmlContentKind.Raw,
    hasAlternativeText: false,
    hasChildren: false,
    tagName: MjmlNodeType.Raw,
  }),
  slots: {},
  type: MjmlNodeType.Raw,
};
