import type { ColumnsNode } from "#shared/models/pageBuilder/ColumnsNode";
import type { ColumnsNodeProps } from "#shared/models/pageBuilder/ColumnsNodeProps";
import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { OwnProps } from "headless-block-editor";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { z } from "zod";

const columnsPropsSchema = z.object({ style: nodeStyleSchema.optional() }) satisfies z.ZodType<
  OwnProps<ColumnsNodeProps>
>;

// A row of Column nodes, which holds nothing else
export const columnsNodeType = {
  css: ".columns { display: flex; flex-wrap: wrap; gap: 1rem; }",
  formSchema: z.strictObject({}),
  isFocusable: false,
  propsSchema: columnsPropsSchema,
  render: (_node, slots) => ({
    attributes: { [HtmlAttributeName.Class]: "columns" },
    children: slots.children,
    tag: HtmlTag.Div,
  }),
  slots: { children: [WebpageNodeType.Column] },
  type: WebpageNodeType.Columns,
} satisfies NodeTypeDefinition<ColumnsNode>;
