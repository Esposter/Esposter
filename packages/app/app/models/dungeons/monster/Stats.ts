import type { Type } from "arktype";

import { type } from "arktype";

export interface Stats {
  attack: number;
  // This is used to calculate the amount of exp you gain when defeating the monster
  baseExp: number;
  level: number;
  maxHp: number;
}

export const statsSchema = type({
  attack: "number > 0",
  baseExp: "number > 0",
  level: "number > 0",
  maxHp: "number > 0",
}) satisfies Type<Stats>;
