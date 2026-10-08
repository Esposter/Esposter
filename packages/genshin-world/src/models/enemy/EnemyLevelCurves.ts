import { z } from "zod";

// The game's level curves the kinds name, each its multiplier at every level from 1, by the curve's own name
export type EnemyLevelCurves = Record<string, number[]>;

export const enemyLevelCurvesSchema = z.record(
  z.string().min(1),
  z.array(z.number().positive()).min(1),
) satisfies z.ZodType<EnemyLevelCurves>;
