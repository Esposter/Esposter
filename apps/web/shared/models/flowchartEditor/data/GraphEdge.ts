import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";
import type { GeneralNodeType } from "#shared/models/flowchartEditor/node/GeneralNodeType";
import type { GraphEdge as BaseGraphEdge, CustomEvent } from "@vue-flow/core";
import type { Except } from "type-fest";

import { graphNodeSchema } from "#shared/models/flowchartEditor/data/GraphNode";
import { generalNodeTypeSchema } from "#shared/models/flowchartEditor/node/GeneralNodeType";
import { z } from "zod";
import { MAX_RESOURCE_CONTENT_LENGTH } from "#shared/services/resource/constants";
import { graphNodeIdSchema } from "#shared/models/flowchartEditor/data/GraphNodeId";

export type GraphEdge = Except<
  BaseGraphEdge<Record<string, unknown>, Record<string, CustomEvent>, GeneralNodeType>,
  "events" | "sourceNode" | "targetNode"
> & { sourceNode: GraphNode; targetNode: GraphNode };

export const graphEdgeSchema = z.object({
  data: z.record(z.string().max(MAX_RESOURCE_CONTENT_LENGTH), z.unknown()),
  id: z.string().max(MAX_RESOURCE_CONTENT_LENGTH),
  selected: z.boolean(),
  source: graphNodeIdSchema,
  sourceNode: graphNodeSchema,
  sourceX: z.int(),
  sourceY: z.int(),
  target: graphNodeIdSchema,
  targetNode: graphNodeSchema,
  targetX: z.int(),
  targetY: z.int(),
  type: generalNodeTypeSchema,
}) satisfies z.ZodType<GraphEdge>;
