import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { z } from "zod";

export const userIdSchema = z.object({ userId: selectUserInAuthSchema.shape.id });
