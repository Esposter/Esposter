import type { Edge, Node } from "@vue-flow/core";
import type { Except } from "type-fest";

import { edgeSchema } from "@/models/flowchartEditor/Edge";
import { nodeSchema } from "@/models/flowchartEditor/Node";
import { applyItemMetadataMixin, itemMetadataSchema } from "@/shared/models/entity/ItemMetadata";
import { z } from "zod";

export type FlowchartEditor = typeof FlowchartEditor.prototype;

class BaseFlowchartEditor {
  edges: Edge[] = [];
  nodes: Node[] = [];

  toJSON() {
    return JSON.stringify({ ...this });
  }
}
export const FlowchartEditor = applyItemMetadataMixin(BaseFlowchartEditor);

export const flowchartEditorSchema = z
  .object({
    edges: z.array(edgeSchema),
    nodes: z.array(nodeSchema),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<FlowchartEditor, "toJSON">>;
