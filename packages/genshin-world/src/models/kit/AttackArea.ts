import { z } from "zod";

// A hit's reach as a cylinder about the body's feet: a fan of an angle in radians, a radius and a height, where an angle
// Of 2π is the whole circle. A forward offset, in metres ahead of the feet along the facing, moves the cylinder's centre
// Ahead of them; it is absent for every area but the Darkgold Wolfbite's, whose circle sits ahead of the body
export interface AttackArea {
  angle: number;
  forward?: number;
  height: number;
  radius: number;
}

export const attackAreaSchema = z.object({
  angle: z.number().positive(),
  forward: z.number().nonnegative().optional(),
  height: z.number().positive(),
  radius: z.number().nonnegative(),
}) satisfies z.ZodType<AttackArea>;
