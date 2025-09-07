import type { GraphNode as BaseGraphNode, CustomEvent } from "@vue-flow/core";
import type { Except } from "type-fest";

import { dimensionsSchema } from "#shared/models/flowchartEditor/data/Dimensions";
import { graphNodeIdSchema } from "#shared/models/flowchartEditor/data/GraphNodeId";
import { handleBoundsSchema } from "#shared/models/flowchartEditor/data/HandleBounds";
import { xyPositionSchema } from "#shared/models/flowchartEditor/data/XYPosition";
import { xyzPositionSchema } from "#shared/models/flowchartEditor/data/XYZPosition";
import { GeneralNodeType, generalNodeTypeSchema } from "#shared/models/flowchartEditor/node/GeneralNodeType";
import { z } from "zod";

export type GraphNode = Except<
  BaseGraphNode<Record<string, unknown>, Record<string, CustomEvent>, GeneralNodeType>,
  "events" | "style"
> & { style?: Exclude<BaseGraphNode["style"], Function> };

export const graphNodeSchema = z.object({
  computedPosition: xyzPositionSchema,
  data: z.record(z.string(), z.unknown()),
  dimensions: dimensionsSchema,
  dragging: z.boolean(),
  handleBounds: handleBoundsSchema,
  id: graphNodeIdSchema,
  isParent: z.boolean(),
  position: xyPositionSchema,
  resizing: z.boolean(),
  selected: z.boolean(),
  type: generalNodeTypeSchema,
}) satisfies z.ZodType<GraphNode>;
