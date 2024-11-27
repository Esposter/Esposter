import type { Edge, Node } from "@vue-flow/core";
import type { Except } from "type-fest";

import { edgeSchema } from "@/models/flowchartEditor/Edge";
import { nodeSchema } from "@/models/flowchartEditor/Node";
import { applyItemMetadataMixin, itemMetadataSchema } from "@/shared/models/entity/ItemMetadata";
import { z } from "zod";

import { Serializable } from "@/shared/models/entity/Serializable";

export type FlowchartEditor = typeof FlowchartEditor.prototype;

class BaseFlowchartEditor extends Serializable {
  edges: Edge[] = [];
  nodes: Node[] = [];
}
export const FlowchartEditor = applyItemMetadataMixin(BaseFlowchartEditor);

export const flowchartEditorSchema = z
  .object({
    edges: z.array(edgeSchema),
    nodes: z.array(nodeSchema),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<FlowchartEditor, "toJSON">>;
