import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";
import type { GraphEdge as BaseGraphEdge, CustomEvent } from "@vue-flow/core";
import type { Except } from "type-fest";

import { graphNodeSchema } from "#shared/models/flowchartEditor/data/GraphNode";
import { GeneralNodeType, generalNodeTypeSchema } from "#shared/models/flowchartEditor/node/GeneralNodeType";
import { z } from "zod";

export type GraphEdge = Except<
  BaseGraphEdge<Record<string, unknown>, Record<string, CustomEvent>, GeneralNodeType>,
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
  type: generalNodeTypeSchema,
}) satisfies z.ZodType<GraphEdge>;
