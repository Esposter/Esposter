import weaponGrowCurves from "#src/generated/stats/weaponGrowCurves.json";
import { z } from "zod";

// Each curve a weapon's attributes grow along, by the game's name for it: its multiplier at each level from 1
export const WeaponGrowCurveMap: ReadonlyMap<string, readonly number[]> = new Map(
  Object.entries(z.record(z.string(), z.array(z.number())).parse(weaponGrowCurves)),
);
