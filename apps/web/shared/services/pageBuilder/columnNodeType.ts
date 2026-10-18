import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WEBPAGE_PLACEABLE_NODE_TYPES } from "#shared/services/pageBuilder/constants";
import { containerPropsSchema } from "#shared/services/pageBuilder/containerPropsSchema";
import { z } from "zod";

// One column of a Columns node, holding any placeable content
export const columnNodeType = {
  css: ".column { flex: 1 1 0; min-width: 0; }",
  formSchema: z.strictObject({}),
  propsSchema: containerPropsSchema,
  render: (node, slots) => ({ attributes: { class: "column" }, children: slots.children ?? [], tag: "div" }),
  slots: { children: WEBPAGE_PLACEABLE_NODE_TYPES },
  type: WebpageNodeType.Column,
} satisfies NodeTypeDefinition;
