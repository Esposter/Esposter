import { z } from "zod";

// Windrise's water, its surface's level in metres
export interface WindriseWater {
  level: number;
}

export const windriseWaterSchema = z.object({ level: z.number() }) satisfies z.ZodType<WindriseWater>;
