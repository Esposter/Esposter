import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { abyssPeriodSchema } from "#src/models/spiralAbyss/AbyssPeriod";
import { z } from "zod";

// The Moon Spire's periods in the game's schedule table, the slice the Spiral Abyss writer writes, imported on demand and
// Checked against its shape as it arrives
export const readAbyssPeriods = async (): Promise<AbyssPeriod[]> => {
  const { default: periods } = await import("#src/generated/spiralAbyss/periods.json");
  return z.array(abyssPeriodSchema).parse(periods);
};
