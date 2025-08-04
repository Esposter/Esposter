import type { GraphEdge as BaseGraphEdge, CustomEvent } from "@vue-flow/core";
import type { Except } from "type-fest";

import { type GraphNode, graphNodeSchema } from "#shared/models/flowchartEditor/data/GraphNode";
import { NodeType, nodeTypeSchema } from "#shared/models/flowchartEditor/data/NodeType";
import { z } from "zod";

export type GraphEdge = Except<
  BaseGraphEdge<Record<string, unknown>, Record<string, CustomEvent>, NodeType>,
  "events" | "sourceNode" | "targetNode"
> & { sourceNode: GraphNode; targetNode: GraphNode };

export const graphEdgeSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  id: z.string(),
  selected: z.boolean(),
  source: z.string(),
  sourceNode: graphNodeSchema,
  sourceX: z.int(),
  sourceY: z.int(),
  target: z.string(),
  targetNode: graphNodeSchema,
  targetX: z.int(),
  targetY: z.int(),
  type: nodeTypeSchema,
}) satisfies z.ZodType<GraphEdge>;
