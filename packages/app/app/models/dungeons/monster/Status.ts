import type { Type } from "arktype";

import { type } from "arktype";
// This is different from stats and is more dynamic
// as it reflects the current status based on gameplay
export interface Status {
  exp: number;
  hp: number;
}

export const statusSchema = type({
  exp: "number.integer >= 0",
  hp: "number.integer >= 0",
}) satisfies Type<Status>;
