import { z } from "zod";

// A typed array's place in `avatar.bin`: its offset in bytes and its length in elements
export interface AvatarView {
  length: number;
  offset: number;
}

export const avatarViewSchema = z.object({
  length: z.int().nonnegative(),
  offset: z.int().nonnegative(),
}) satisfies z.ZodType<AvatarView>;
