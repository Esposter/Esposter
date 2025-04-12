import type { XYPosition } from "@vue-flow/core";
import type { Type } from "arktype";

import { type } from "arktype";

export const xyPositionSchema = type({
  x: "number",
  y: "number",
}) satisfies Type<XYPosition>;
