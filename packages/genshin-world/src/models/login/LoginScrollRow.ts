import { z } from "zod";

// A row the login scene scrolls past the camera: how many copies of it stand, and how long each copy is in the
// Scene's units
export interface LoginScrollRow {
  count: number;
  length: number;
}

export const loginScrollRowSchema = z.object({
  count: z.int().positive(),
  length: z.number().positive(),
}) satisfies z.ZodType<LoginScrollRow>;
