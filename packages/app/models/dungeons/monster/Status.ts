import { z } from "zod";

export interface Status {
  level: number;
  hp: number;
  exp: number;
}

export const statusSchema = z.object({
  level: z.number().int().positive(),
  hp: z.number().int().positive(),
  exp: z.number().int().positive(),
}) satisfies z.ZodType<Status>;
