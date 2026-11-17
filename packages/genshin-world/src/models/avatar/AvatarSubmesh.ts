import { z } from "zod";

// A run of a mesh's indices, from its first element for its count, drawn with one material by name
export interface AvatarSubmesh {
  count: number;
  material: string;
  start: number;
}

export const avatarSubmeshSchema = z.object({
  count: z.int().positive(),
  // Empty where a run has no material of its own, which the reader draws without one
  material: z.string(),
  start: z.int().nonnegative(),
}) satisfies z.ZodType<AvatarSubmesh>;
