import type { GeneralNodeType } from "#shared/models/flowchartEditor/node/GeneralNodeType";
import type { CustomEvent, Node } from "@vue-flow/core";
import type { SetRequired } from "type-fest";

import { graphNodeIdSchema } from "#shared/models/flowchartEditor/data/GraphNodeId";
import { xyPositionSchema } from "#shared/models/flowchartEditor/data/XYPosition";
import { generalNodeTypeSchema } from "#shared/models/flowchartEditor/node/GeneralNodeType";
import { MAX_RESOURCE_CONTENT_LENGTH } from "#shared/services/resource/constants";
import { z } from "zod";

// What defines a node and nothing the canvas derives from it: its measured size, handle bounds and selection are
// Recomputed on every mount, so persisting them only makes a save fail on a value the canvas owns. The style is
// The one field the canvas writes back, carrying a picked colour and a resized node's width and height
export type GraphNode = SetRequired<
  Pick<
    Node<Record<string, unknown>, Record<string, CustomEvent>, GeneralNodeType>,
    "data" | "id" | "position" | "type"
  >,
  "data" | "type"
> & { style?: Record<string, string> };

export const graphNodeSchema = z.object({
  data: z.record(z.string().max(MAX_RESOURCE_CONTENT_LENGTH), z.unknown()),
  id: graphNodeIdSchema,
  position: xyPositionSchema,
  style: z.record(z.string().max(MAX_RESOURCE_CONTENT_LENGTH), z.string().max(MAX_RESOURCE_CONTENT_LENGTH)).optional(),
  type: generalNodeTypeSchema,
}) satisfies z.ZodType<GraphNode>;
