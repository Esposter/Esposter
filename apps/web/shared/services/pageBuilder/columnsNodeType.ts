import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { containerPropsSchema } from "#shared/services/pageBuilder/containerPropsSchema";
import { z } from "zod";

// A row of Column nodes, which holds nothing else
export const columnsNodeType = {
  css: ".columns { display: flex; flex-wrap: wrap; gap: 1rem; }",
  formSchema: z.strictObject({}),
  propsSchema: containerPropsSchema,
  render: (_node, slots) => ({
    attributes: { [HtmlAttributeName.Class]: "columns" },
    children: slots.children ?? [],
    tag: HtmlTag.Div,
  }),
  slots: { children: [WebpageNodeType.Column] },
  type: WebpageNodeType.Columns,
} satisfies NodeTypeDefinition;
