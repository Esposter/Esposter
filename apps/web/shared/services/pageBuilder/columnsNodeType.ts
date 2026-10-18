import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { z } from "zod";

const columnsPropsSchema = z.strictObject({ children: z.array(z.unknown()), id: z.string() });

// A row of Column nodes, which holds nothing else
export const columnsNodeType = {
  css: ".columns { display: flex; flex-wrap: wrap; gap: 1rem; }",
  formSchema: z.strictObject({}),
  propsSchema: columnsPropsSchema,
  render: (_node, slots) => ({ attributes: { class: "columns" }, children: slots.children ?? [], tag: "div" }),
  slots: { children: [WebpageNodeType.Column] },
  type: WebpageNodeType.Columns,
} satisfies NodeTypeDefinition;
