import { z } from "zod";

// A hit's reach as a cylinder about the body's feet: a fan of an angle in radians, a radius and a height, where an angle
// Of 2π is the whole circle
export interface AttackArea {
  angle: number;
  height: number;
  radius: number;
}

export const attackAreaSchema = z.object({
  angle: z.number().positive(),
  height: z.number().positive(),
  radius: z.number().nonnegative(),
}) satisfies z.ZodType<AttackArea>;
