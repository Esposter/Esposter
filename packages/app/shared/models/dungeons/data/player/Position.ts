import type { Type } from "arktype";
import type { Position } from "grid-engine";

import { type } from "arktype";

export const positionSchema = type({
  x: "number.integer >= 0",
  y: "number.integer >= 0",
}) satisfies Type<Position>;
