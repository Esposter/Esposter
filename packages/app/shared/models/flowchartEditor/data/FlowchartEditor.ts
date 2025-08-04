import type { ToData } from "#shared/models/entity/ToData";
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";
import type { Edge } from "@vue-flow/core";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { edgeSchema } from "#shared/models/flowchartEditor/data/Edge";
import { graphNodeSchema } from "#shared/models/flowchartEditor/data/GraphNode";
import { z } from "zod";

export class FlowchartEditor extends AItemEntity {
  edges: Edge[] = [];
  nodes: GraphNode[] = [];

  constructor(init?: Partial<FlowchartEditor>) {
    super();
    Object.assign(this, init);
  }
}

export const flowchartEditorSchema = z.object({
  ...aItemEntitySchema.shape,
  edges: edgeSchema.array(),
  nodes: graphNodeSchema.array(),
}) satisfies z.ZodType<ToData<FlowchartEditor>>;
