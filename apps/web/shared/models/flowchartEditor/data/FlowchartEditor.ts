import type { GraphEdge } from "#shared/models/flowchartEditor/data/GraphEdge";
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";
import type { ToData } from "@esposter/shared";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { graphEdgeSchema } from "#shared/models/flowchartEditor/data/GraphEdge";
import { graphNodeSchema } from "#shared/models/flowchartEditor/data/GraphNode";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export class FlowchartEditor extends AItemEntity {
  edges: GraphEdge[] = [];
  nodes: GraphNode[] = [];

  constructor(init?: Partial<FlowchartEditor>) {
    super();
    Object.assign(this, init);
  }
}

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- ConnectionLineType and MarkerType come from @vue-flow/core on both sides (GraphEdge.ts:6); the rule flags a zod object nested in an array even on an exact enum match
export const flowchartEditorSchema = z.object({
  ...aItemEntitySchema.shape,
  edges: createUniqueArraySchema(graphEdgeSchema, "id").max(MAX_RESOURCE_CONTENT_SIZE),
  nodes: createUniqueArraySchema(graphNodeSchema, "id").max(MAX_RESOURCE_CONTENT_SIZE),
}) satisfies z.ZodType<ToData<FlowchartEditor>>;
