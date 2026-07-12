import { BASE_DEFENSE } from "#shared/services/dungeons/monster/constants";
import { z } from "zod";

export interface Stats {
  attack: number;
  // This is used to calculate the amount of exp you gain when defeating the monster
  baseExp: number;
  defense: number;
  level: number;
  maxHp: number;
}

export const statsSchema = z.object({
  attack: z.int().positive(),
  baseExp: z.int().positive(),
  // Saves written before the defense stat existed omit it — default to the shared species base
  defense: z.int().positive().default(BASE_DEFENSE),
  level: z.int().positive(),
  maxHp: z.int().positive(),
}) satisfies z.ZodType<Stats>;
