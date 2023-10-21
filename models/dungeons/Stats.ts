import { z } from "zod";

export interface Stats {
  health: number;
  attack: number;
  armor: number;
}

export const statsSchema = z.object({
  health: z.number().int(),
  attack: z.number().int(),
  armor: z.number().int(),
}) satisfies z.ZodType<Stats>;
