import type { ToData } from "#shared/models/entity/ToData";
import type { Edge, Node } from "@vue-flow/core";
import type { Type } from "arktype";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { edgeSchema } from "#shared/models/flowchartEditor/data/Edge";
import { nodeSchema } from "#shared/models/flowchartEditor/data/Node";
import { type } from "arktype";

export class FlowchartEditor extends AItemEntity {
  edges: Edge[] = [];
  nodes: Node[] = [];
}

export const flowchartEditorSchema = aItemEntitySchema.merge(
  type({
    edges: edgeSchema.array(),
    nodes: nodeSchema.array(),
  }),
) satisfies Type<ToData<FlowchartEditor>>;
