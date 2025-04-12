import type { Edge } from "@vue-flow/core";
import type { Type } from "arktype";

import { type } from "arktype";

export const edgeSchema = type({
  id: "string",
  source: "string",
  target: "string",
}) satisfies Type<Edge>;
