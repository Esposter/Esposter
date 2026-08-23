import { selectUserSchema } from "#src/schema/users";
import { z } from "zod";

export const userIdSchema = z.object({
  userId: selectUserSchema.shape.id,
});
