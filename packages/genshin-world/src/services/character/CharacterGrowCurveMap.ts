import characterGrowCurves from "#src/generated/stats/characterGrowCurves.json";
import { z } from "zod";

// Each curve a character's attributes grow along, by the game's name for it: its multiplier at each level from 1
export const CharacterGrowCurveMap: ReadonlyMap<string, readonly number[]> = new Map(
  Object.entries(z.record(z.string(), z.array(z.number())).parse(characterGrowCurves)),
);
