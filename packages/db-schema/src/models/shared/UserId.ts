import { z } from "zod";

export const userIdSchema = z.object({
  // @TODO: https://github.com/drizzle-team/drizzle-orm/issues/4705
  // UserId: selectUserSchema.shape.id,
  userId: z.string(),
});
