import type { GraphEdge } from "#shared/models/flowchartEditor/data/GraphEdge";
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";
import type { ToData } from "@esposter/shared";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { graphEdgeSchema } from "#shared/models/flowchartEditor/data/GraphEdge";
import { graphNodeSchema } from "#shared/models/flowchartEditor/data/GraphNode";
import { z } from "zod";

export class FlowchartEditor extends AItemEntity {
  edges: GraphEdge[] = [];
  nodes: GraphNode[] = [];

  constructor(init?: Partial<FlowchartEditor>) {
    super();
    Object.assign(this, init);
  }
}

export const flowchartEditorSchema = z.object({
  ...aItemEntitySchema.shape,
  edges: graphEdgeSchema.array(),
  nodes: graphNodeSchema.array(),
}) satisfies z.ZodType<ToData<FlowchartEditor>>;
