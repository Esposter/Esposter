import type { ToData } from "#shared/models/entity/ToData";
import type { Edge, Node } from "@vue-flow/core";

import { applyItemMetadataMixin, itemMetadataSchema } from "#shared/models/entity/ItemMetadata";
import { Serializable } from "#shared/models/entity/Serializable";
import { edgeSchema } from "#shared/models/flowchartEditor/data/Edge";
import { nodeSchema } from "#shared/models/flowchartEditor/data/Node";
import { z } from "zod";

class BaseFlowchartEditor extends Serializable {
  edges: Edge[] = [];
  nodes: Node[] = [];
}
export const FlowchartEditor = applyItemMetadataMixin(BaseFlowchartEditor);
export type FlowchartEditor = typeof FlowchartEditor.prototype;

export const flowchartEditorSchema = z
  .object({
    edges: z.array(edgeSchema),
    nodes: z.array(nodeSchema),
  })
  .merge(itemMetadataSchema) as const satisfies z.ZodType<ToData<FlowchartEditor>>;
