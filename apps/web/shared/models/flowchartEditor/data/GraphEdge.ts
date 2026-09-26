import type { CustomEvent, DefaultEdge } from "@vue-flow/core";
import type { SetRequired } from "type-fest";

import { graphNodeIdSchema } from "#shared/models/flowchartEditor/data/GraphNodeId";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { ConnectionLineType } from "@vue-flow/core";
import { z } from "zod";

// An edge is its two ends and its path's kind. Its coordinates and the copies of both end nodes the canvas hangs
// On it are derived from the nodes on every render, so they are never stored
export type GraphEdge = SetRequired<
  Pick<
    DefaultEdge<Record<string, unknown>, Record<string, CustomEvent>, ConnectionLineType>,
    "data" | "id" | "source" | "sourceHandle" | "target" | "targetHandle" | "type"
  >,
  "data" | "type"
>;

export const graphEdgeSchema = z.object({
  data: z.record(z.string().max(MAX_RESOURCE_CONTENT_SIZE), z.unknown()),
  id: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
  source: graphNodeIdSchema,
  sourceHandle: z.string().max(MAX_RESOURCE_CONTENT_SIZE).nullish(),
  target: graphNodeIdSchema,
  targetHandle: z.string().max(MAX_RESOURCE_CONTENT_SIZE).nullish(),
  // The canvas names a connection's path by the same values it names its connection line by, and stamps
  // "default" on an edge drawn with no type of its own
  type: z.enum(ConnectionLineType),
}) satisfies z.ZodType<GraphEdge>;
