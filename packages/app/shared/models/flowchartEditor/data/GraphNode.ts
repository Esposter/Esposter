import type { CustomEvent, GraphNode } from "@vue-flow/core";
import type { Except } from "type-fest";

import { dimensionsSchema } from "#shared/models/flowchartEditor/data/Dimensions";
import { graphNodeIdSchema } from "#shared/models/flowchartEditor/data/GraphNodeId";
import { handleBoundsSchema } from "#shared/models/flowchartEditor/data/HandleBounds";
import { NodeType, nodeTypeSchema } from "#shared/models/flowchartEditor/data/NodeType";
import { xyPositionSchema } from "#shared/models/flowchartEditor/data/XYPosition";
import { xyzPositionSchema } from "#shared/models/flowchartEditor/data/XYZPosition";
import { z } from "zod";

export const graphNodeSchema = z.object({
  computedPosition: xyzPositionSchema,
  data: z.unknown(),
  dimensions: dimensionsSchema,
  dragging: z.boolean(),
  handleBounds: handleBoundsSchema,
  id: graphNodeIdSchema,
  isParent: z.boolean(),
  position: xyPositionSchema,
  resizing: z.boolean(),
  selected: z.boolean(),
  type: nodeTypeSchema,
}) satisfies z.ZodType<Except<GraphNode<unknown, Record<string, CustomEvent>, NodeType>, "events">>;
