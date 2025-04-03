import type { ToData } from "#shared/models/entity/ToData";
import type { Edge, Node } from "@vue-flow/core";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { edgeSchema } from "#shared/models/flowchartEditor/data/Edge";
import { nodeSchema } from "#shared/models/flowchartEditor/data/Node";
import { z } from "zod";

export class FlowchartEditor extends AItemEntity {
  edges: Edge[] = [];
  nodes: Node[] = [];
}

export const flowchartEditorSchema = z
  .object({
    edges: z.array(edgeSchema),
    nodes: z.array(nodeSchema),
  })
  .merge(aItemEntitySchema) satisfies z.ZodType<ToData<FlowchartEditor>>;
