import type { Node } from "@vue-flow/core";
import type { Type } from "arktype";

import { xyPositionSchema } from "#shared/models/flowchartEditor/data/XYPosition";
import { type } from "arktype";

export const nodeSchema = type({
  id: "string",
  position: xyPositionSchema,
}) satisfies Type<Node>;
