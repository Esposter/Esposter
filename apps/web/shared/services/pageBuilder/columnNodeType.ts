import type { ColumnNode } from "#shared/models/pageBuilder/ColumnNode";
import type { ColumnNodeProps } from "#shared/models/pageBuilder/ColumnNodeProps";
import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { OwnProps } from "headless-block-editor";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WEBPAGE_PLACEABLE_NODE_TYPES } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

const columnPropsSchema = z.object({ style: nodeStyleSchema.optional() }) satisfies z.ZodType<
  OwnProps<ColumnNodeProps>
>;

// One column of a Columns node, holding any placeable content
export const columnNodeType = {
  css: ".column { flex: 1 1 0; min-width: 0; }",
  formSchema: z.strictObject({}),
  isFocusable: false,
  propsSchema: columnPropsSchema,
  render: (_node, slots) => ({
    attributes: { [HtmlAttributeName.Class]: "column" },
    children: slots.children,
    tag: HtmlTag.Div,
  }),
  slots: { children: WEBPAGE_PLACEABLE_NODE_TYPES },
  type: WebpageNodeType.Column,
} satisfies NodeTypeDefinition<ColumnNode>;
