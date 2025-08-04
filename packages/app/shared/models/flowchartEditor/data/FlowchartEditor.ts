import type { ToData } from "#shared/models/entity/ToData";
import type { NodeType } from "#shared/models/flowchartEditor/data/NodeType";
import type { CustomEvent, Edge, GraphNode } from "@vue-flow/core";
import type { Except } from "type-fest";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { edgeSchema } from "#shared/models/flowchartEditor/data/Edge";
import { graphNodeSchema } from "#shared/models/flowchartEditor/data/GraphNode";
import { z } from "zod";

export class FlowchartEditor extends AItemEntity {
  edges: Edge[] = [];
  nodes: Except<GraphNode<unknown, Record<string, CustomEvent>, NodeType>, "events">[] = [];

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
